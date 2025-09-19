'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  HeartIcon, 
  UserGroupIcon, 
  HomeIcon, 
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

export function HomePage() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [isWizardLoading, setIsWizardLoading] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <AuthenticatedHome user={user} />;
  }

  return <PublicHome />;
}

function PublicHome() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gradient">Evangelism App</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="btn-outline">
                Sign In
              </Link>
              <Link href="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-primary-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Spiritual Journey
              <span className="block text-gradient">Starts Here</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover personalized Scripture, connect with mentors, and find your church community. 
              Let us guide you on your path to a deeper relationship with God.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/wizard" className="btn-primary btn-lg">
                <SparklesIcon className="w-5 h-5 mr-2" />
                Start Your Journey
              </Link>
              <Link href="/about" className="btn-outline btn-lg">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for Spiritual Growth
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform provides personalized guidance, mentorship, and community connections.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <HeartIcon className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Personalized Scripture</h3>
              <p className="text-gray-600">
                Get 50 personalized Bible references, a custom prayer, and annotated verses tailored to your spiritual journey.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <UserGroupIcon className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Mentorship</h3>
              <p className="text-gray-600">
                Connect with experienced mentors who understand your struggles and can guide you through your faith journey.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <HomeIcon className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Church Connection</h3>
              <p className="text-gray-600">
                Find and connect with local churches that match your needs and help you grow in your faith community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to transform your spiritual life
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Answer Questions</h3>
              <p className="text-gray-600">
                Share your spiritual background, current struggles, and what you're seeking.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Get AI Guidance</h3>
              <p className="text-gray-600">
                Receive personalized Scripture, prayer, and verses tailored to your situation.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect with Mentors</h3>
              <p className="text-gray-600">
                Find mentors who understand your journey and can provide ongoing support.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Join Community</h3>
              <p className="text-gray-600">
                Connect with local churches and grow in your faith community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Spiritual Journey?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands who have found hope, healing, and purpose through our platform.
          </p>
          <Link href="/wizard" className="btn bg-white text-primary-600 hover:bg-gray-50 btn-lg">
            <SparklesIcon className="w-5 h-5 mr-2" />
            Begin Your Journey
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Evangelism App</h3>
            <p className="text-gray-400 mb-4">
              Connecting hearts to God through personalized guidance and community.
            </p>
            <div className="flex justify-center space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link>
              <Link href="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link>
              <Link href="/contact" className="text-gray-400 hover:text-white">Contact Us</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AuthenticatedHome({ user }: { user: any }) {
  const getDashboardUrl = () => {
    switch (user.userRole) {
      case 'SEEKER':
        return '/dashboard/seeker';
      case 'DISCIPLE_MAKER':
        return '/dashboard/mentor';
      case 'CHURCH_FINDER':
        return '/dashboard/church-finder';
      case 'ADMIN':
        return '/dashboard/admin';
      default:
        return '/dashboard';
    }
  };

  const getRoleDisplayName = () => {
    switch (user.userRole) {
      case 'SEEKER':
        return 'Seeker';
      case 'DISCIPLE_MAKER':
        return 'Mentor';
      case 'CHURCH_FINDER':
        return 'Church Finder';
      case 'ADMIN':
        return 'Administrator';
      default:
        return 'User';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gradient">Evangelism App</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.username}
              </span>
              <Link href={getDashboardUrl()} className="btn-primary">
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Welcome Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome back, {user.username}!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Continue your spiritual journey as a {getRoleDisplayName()}
          </p>
          <Link href={getDashboardUrl()} className="btn-primary btn-lg">
            <ArrowRightIcon className="w-5 h-5 mr-2" />
            Access Your Dashboard
          </Link>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Quick Actions
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Link href="/wizard" className="card hover:shadow-lg transition-shadow">
              <div className="card-body text-center">
                <SparklesIcon className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Spiritual Wizard</h3>
                <p className="text-gray-600 mb-4">
                  Get personalized Scripture and prayer guidance
                </p>
                <Button className="w-full">Start Wizard</Button>
              </div>
            </Link>

            <Link href="/messages" className="card hover:shadow-lg transition-shadow">
              <div className="card-body text-center">
                <ChatBubbleLeftRightIcon className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Messages</h3>
                <p className="text-gray-600 mb-4">
                  Connect with mentors and community members
                </p>
                <Button className="w-full">View Messages</Button>
              </div>
            </Link>

            <Link href="/sessions" className="card hover:shadow-lg transition-shadow">
              <div className="card-body text-center">
                <CalendarDaysIcon className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Sessions</h3>
                <p className="text-gray-600 mb-4">
                  Book and manage your mentoring sessions
                </p>
                <Button className="w-full">View Sessions</Button>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


