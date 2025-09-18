import { prisma } from './database';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface MatchingCriteria {
  ageCompatibility: number;
  struggleCompatibility: number;
  communicationCompatibility: number;
  formatCompatibility: number;
  locationCompatibility: number;
  overallScore: number;
}

export interface MentorMatch {
  mentorId: number;
  mentor: any;
  score: number;
  reasons: string[];
  compatibility: MatchingCriteria;
}

/**
 * Calculate compatibility score between seeker and mentor
 */
export async function calculateMatchingScore(
  seekerId: number,
  mentorId: number
): Promise<MatchingCriteria> {
  const seeker = await prisma.user.findUnique({
    where: { id: seekerId },
    include: { seekerProfile: true }
  });

  const mentor = await prisma.mentorProfile.findUnique({
    where: { userId: mentorId },
    include: { user: true }
  });

  if (!seeker || !mentor) {
    throw new Error('User not found');
  }

  // Age compatibility (0-1)
  const ageCompatibility = calculateAgeCompatibility(
    seeker.ageRange,
    mentor.user.ageRange
  );

  // Struggle compatibility (0-1)
  const struggleCompatibility = calculateStruggleCompatibility(
    seeker.struggles || [],
    mentor.traumas || [],
    mentor.specialties || []
  );

  // Communication compatibility (0-1)
  const communicationCompatibility = calculateCommunicationCompatibility(
    seeker.preferredCommunication,
    mentor.communicationPreference
  );

  // Format compatibility (0-1)
  const formatCompatibility = calculateFormatCompatibility(
    seeker.preferredFormat,
    mentor.sessionTypes
  );

  // Location compatibility (0-1)
  const locationCompatibility = calculateLocationCompatibility(
    seeker.location,
    mentor.user.location
  );

  // Calculate weighted overall score
  const weights = {
    age: 0.15,
    struggle: 0.35,
    communication: 0.20,
    format: 0.20,
    location: 0.10
  };

  const overallScore = 
    ageCompatibility * weights.age +
    struggleCompatibility * weights.struggle +
    communicationCompatibility * weights.communication +
    formatCompatibility * weights.format +
    locationCompatibility * weights.location;

  return {
    ageCompatibility,
    struggleCompatibility,
    communicationCompatibility,
    formatCompatibility,
    locationCompatibility,
    overallScore
  };
}

/**
 * Calculate age compatibility score
 */
function calculateAgeCompatibility(seekerAge?: string, mentorAge?: string): number {
  if (!seekerAge || !mentorAge) return 0.5; // Neutral if unknown

  const ageRanges = {
    'teen': 1,
    'young_adult': 2,
    'adult': 3,
    'middle_age': 4,
    'senior': 5
  };

  const seekerAgeNum = ageRanges[seekerAge as keyof typeof ageRanges] || 3;
  const mentorAgeNum = ageRanges[mentorAge as keyof typeof ageRanges] || 3;

  const ageDiff = Math.abs(seekerAgeNum - mentorAgeNum);
  
  // Perfect match = 1.0, 1 age group difference = 0.8, 2+ = 0.6
  if (ageDiff === 0) return 1.0;
  if (ageDiff === 1) return 0.8;
  if (ageDiff === 2) return 0.6;
  return 0.4;
}

/**
 * Calculate struggle compatibility score
 */
function calculateStruggleCompatibility(
  seekerStruggles: string[],
  mentorTraumas: string[],
  mentorSpecialties: string[]
): number {
  if (seekerStruggles.length === 0) return 0.5;

  let matchCount = 0;
  let totalWeight = 0;

  for (const struggle of seekerStruggles) {
    totalWeight += 1;
    
    // Direct trauma match (highest weight)
    if (mentorTraumas.includes(struggle)) {
      matchCount += 1.0;
    }
    // Specialty match (medium weight)
    else if (mentorSpecialties.includes(struggle)) {
      matchCount += 0.7;
    }
    // Related specialty match (lower weight)
    else if (isRelatedStruggle(struggle, mentorSpecialties)) {
      matchCount += 0.4;
    }
  }

  return totalWeight > 0 ? matchCount / totalWeight : 0.5;
}

/**
 * Check if struggle is related to mentor specialties
 */
function isRelatedStruggle(struggle: string, specialties: string[]): boolean {
  const relatedGroups = {
    'addiction': ['substance_abuse', 'recovery', 'sobriety'],
    'depression': ['mental_health', 'anxiety', 'emotional_healing'],
    'anxiety': ['mental_health', 'depression', 'emotional_healing'],
    'family_issues': ['family_healing', 'relationships', 'marriage'],
    'grief': ['loss', 'healing', 'emotional_healing'],
    'anger': ['emotional_healing', 'self_control', 'spiritual_growth'],
    'pornography': ['addiction', 'purity', 'sexual_healing'],
    'porn_addiction': ['addiction', 'purity', 'sexual_healing']
  };

  const related = relatedGroups[struggle as keyof typeof relatedGroups] || [];
  return specialties.some(specialty => related.includes(specialty));
}

/**
 * Calculate communication compatibility
 */
function calculateCommunicationCompatibility(
  seekerPref?: string,
  mentorPref?: string
): number {
  if (!seekerPref || !mentorPref) return 0.5;

  if (seekerPref === mentorPref) return 1.0;
  if (seekerPref === 'both' || mentorPref === 'both') return 0.8;
  return 0.3; // Incompatible preferences
}

/**
 * Calculate format compatibility
 */
function calculateFormatCompatibility(
  seekerPref?: string,
  mentorPref?: string
): number {
  if (!seekerPref || !mentorPref) return 0.5;

  if (seekerPref === mentorPref) return 1.0;
  if (seekerPref === 'both' || mentorPref === 'both') return 0.8;
  return 0.3; // Incompatible preferences
}

/**
 * Calculate location compatibility
 */
function calculateLocationCompatibility(
  seekerLocation?: string,
  mentorLocation?: string
): number {
  if (!seekerLocation || !mentorLocation) return 0.5;

  // Exact match
  if (seekerLocation.toLowerCase() === mentorLocation.toLowerCase()) {
    return 1.0;
  }

  // Same city/state (simplified check)
  const seekerParts = seekerLocation.toLowerCase().split(',');
  const mentorParts = mentorLocation.toLowerCase().split(',');
  
  if (seekerParts.length > 1 && mentorParts.length > 1) {
    if (seekerParts[1].trim() === mentorParts[1].trim()) {
      return 0.8; // Same state
    }
  }

  return 0.5; // Different locations
}

/**
 * Find best mentor matches for a seeker using AI
 */
export async function findMentorMatches(
  seekerId: number,
  limit: number = 10
): Promise<MentorMatch[]> {
  const seeker = await prisma.user.findUnique({
    where: { id: seekerId },
    include: { seekerProfile: true }
  });

  if (!seeker) {
    throw new Error('Seeker not found');
  }

  // Get all active, approved mentors
  const mentors = await prisma.mentorProfile.findMany({
    where: {
      isActive: true,
      user: {
        isApproved: true,
        userRole: 'DISCIPLE_MAKER'
      }
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          location: true,
          ageRange: true,
          gender: true
        }
      }
    }
  });

  // Calculate scores for all mentors
  const matches: MentorMatch[] = [];

  for (const mentor of mentors) {
    try {
      const compatibility = await calculateMatchingScore(seekerId, mentor.userId);
      
      if (compatibility.overallScore >= 0.3) { // Minimum threshold
        const reasons = generateMatchReasons(seeker, mentor, compatibility);
        
        matches.push({
          mentorId: mentor.userId,
          mentor,
          score: compatibility.overallScore,
          reasons,
          compatibility
        });
      }
    } catch (error) {
      console.error(`Error calculating match for mentor ${mentor.userId}:`, error);
    }
  }

  // Sort by score and return top matches
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Generate human-readable reasons for the match
 */
function generateMatchReasons(
  seeker: any,
  mentor: any,
  compatibility: MatchingCriteria
): string[] {
  const reasons: string[] = [];

  if (compatibility.struggleCompatibility >= 0.8) {
    reasons.push('Has personal experience with your struggles');
  } else if (compatibility.struggleCompatibility >= 0.6) {
    reasons.push('Specializes in areas related to your needs');
  }

  if (compatibility.ageCompatibility >= 0.8) {
    reasons.push('Similar life stage and experience');
  }

  if (compatibility.communicationCompatibility >= 0.8) {
    reasons.push('Matches your communication preferences');
  }

  if (compatibility.formatCompatibility >= 0.8) {
    reasons.push('Offers your preferred session format');
  }

  if (compatibility.locationCompatibility >= 0.8) {
    reasons.push('Located in your area');
  }

  if (reasons.length === 0) {
    reasons.push('Good overall compatibility');
  }

  return reasons;
}

/**
 * Use AI to enhance matching with personalized recommendations
 */
export async function getAIMentorRecommendations(
  seekerId: number,
  topMatches: MentorMatch[]
): Promise<MentorMatch[]> {
  const seeker = await prisma.user.findUnique({
    where: { id: seekerId },
    include: { seekerProfile: true }
  });

  if (!seeker || topMatches.length === 0) {
    return topMatches;
  }

  try {
    const prompt = `
    Based on this seeker's profile and the top mentor matches, provide personalized recommendations.
    
    Seeker Profile:
    - Struggles: ${JSON.stringify(seeker.struggles)}
    - Age Range: ${seeker.ageRange}
    - Location: ${seeker.location}
    - Preferred Communication: ${seeker.preferredCommunication}
    - Preferred Format: ${seeker.preferredFormat}
    
    Top Matches:
    ${topMatches.map((match, index) => `
    ${index + 1}. ${match.mentor.user.username}
       - Specialties: ${JSON.stringify(match.mentor.specialties)}
       - Years Christian: ${match.mentor.yearsChristian}
       - Score: ${match.score.toFixed(2)}
    `).join('\n')}
    
    Provide 3-5 personalized reasons why these mentors would be good matches for this seeker.
    Focus on specific struggles, life experiences, and compatibility factors.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.7
    });

    const aiRecommendations = response.choices[0].message.content;
    
    // Add AI recommendations to the top match
    if (topMatches.length > 0) {
      topMatches[0].reasons.push(`AI Insight: ${aiRecommendations}`);
    }

  } catch (error) {
    console.error('Error getting AI mentor recommendations:', error);
  }

  return topMatches;
}

/**
 * Save matching scores to database
 */
export async function saveMatchingScores(
  seekerId: number,
  mentorId: number,
  compatibility: MatchingCriteria
): Promise<void> {
  await prisma.matchingScore.upsert({
    where: {
      seekerId_mentorId: {
        seekerId,
        mentorId
      }
    },
    update: {
      ageCompatibility: compatibility.ageCompatibility,
      struggleCompatibility: compatibility.struggleCompatibility,
      communicationCompatibility: compatibility.communicationCompatibility,
      formatCompatibility: compatibility.formatCompatibility,
      overallScore: compatibility.overallScore,
      calculatedAt: new Date()
    },
    create: {
      seekerId,
      mentorId,
      ageCompatibility: compatibility.ageCompatibility,
      struggleCompatibility: compatibility.struggleCompatibility,
      communicationCompatibility: compatibility.communicationCompatibility,
      formatCompatibility: compatibility.formatCompatibility,
      overallScore: compatibility.overallScore
    }
  });
}


