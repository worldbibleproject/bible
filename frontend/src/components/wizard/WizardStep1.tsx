'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
interface WizardFormData {
  feeling: string;
  barrier: string;
  heart: string;
  spiritual_background: string;
  life_stage: string;
  preferred_style: string;
}

interface WizardStep1Props {
  data: WizardFormData | null;
  onSubmit: (data: WizardFormData) => void;
}

export function WizardStep1({ data, onSubmit }: WizardStep1Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<WizardFormData>({
    defaultValues: data || {}
  });

  const onFormSubmit = (formData: WizardFormData) => {
    onSubmit(formData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Tell Us About Your Spiritual Journey
        </h2>
        <p className="text-lg text-gray-600">
          Answer these questions to help us provide you with personalized guidance
        </p>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div>
          <label className="form-label">
            How are you feeling about your spiritual life right now?
          </label>
          <select
            {...register('feeling', { required: 'Please select how you are feeling' })}
            className="form-select"
          >
            <option value="">Choose your current feeling...</option>
            <option value="lost">Lost and confused</option>
            <option value="searching">Searching for meaning</option>
            <option value="curious">Curious about God</option>
            <option value="struggling">Struggling with faith</option>
            <option value="hopeful">Hopeful but uncertain</option>
            <option value="ready">Ready to grow</option>
          </select>
          {errors.feeling && (
            <p className="form-error">{errors.feeling.message}</p>
          )}
        </div>

        <div>
          <label className="form-label">
            What barriers do you feel are preventing you from approaching God?
          </label>
          <select
            {...register('barrier', { required: 'Please select a barrier' })}
            className="form-select"
          >
            <option value="">Choose your main barrier...</option>
            <option value="guilt">Guilt and shame</option>
            <option value="doubt">Doubt and questions</option>
            <option value="hurt">Past hurt from church</option>
            <option value="busy">Too busy with life</option>
            <option value="unworthy">Feeling unworthy</option>
            <option value="confused">Confused about faith</option>
            <option value="none">No major barriers</option>
          </select>
          {errors.barrier && (
            <p className="form-error">{errors.barrier.message}</p>
          )}
        </div>

        <div>
          <label className="form-label">
            What's on your heart right now? What are you going through?
          </label>
          <textarea
            {...register('heart', { 
              required: 'Please share what\'s on your heart',
              minLength: { value: 10, message: 'Please provide more details' }
            })}
            className="form-textarea"
            rows={4}
            placeholder="Share your current situation, struggles, or what you're seeking..."
          />
          {errors.heart && (
            <p className="form-error">{errors.heart.message}</p>
          )}
        </div>

        <div>
          <label className="form-label">
            What is your spiritual background?
          </label>
          <select
            {...register('spiritual_background', { required: 'Please select your background' })}
            className="form-select"
          >
            <option value="">Choose your background...</option>
            <option value="none">No religious background</option>
            <option value="christian">Grew up Christian</option>
            <option value="other_religion">Other religion</option>
            <option value="agnostic">Agnostic</option>
            <option value="atheist">Atheist</option>
            <option value="seeking">Seeking/exploring</option>
            <option value="fallen_away">Fallen away from faith</option>
          </select>
          {errors.spiritual_background && (
            <p className="form-error">{errors.spiritual_background.message}</p>
          )}
        </div>

        <div>
          <label className="form-label">
            What stage of life are you in?
          </label>
          <select
            {...register('life_stage', { required: 'Please select your life stage' })}
            className="form-select"
          >
            <option value="">Choose your life stage...</option>
            <option value="teen">Teenager (13-19)</option>
            <option value="young_adult">Young Adult (20-29)</option>
            <option value="adult">Adult (30-49)</option>
            <option value="middle_age">Middle Age (50-64)</option>
            <option value="senior">Senior (65+)</option>
          </select>
          {errors.life_stage && (
            <p className="form-error">{errors.life_stage.message}</p>
          )}
        </div>

        <div>
          <label className="form-label">
            What style of spiritual guidance appeals to you most?
          </label>
          <select
            {...register('preferred_style', { required: 'Please select your preferred style' })}
            className="form-select"
          >
            <option value="">Choose your preferred style...</option>
            <option value="gentle">Gentle and encouraging</option>
            <option value="direct">Direct and challenging</option>
            <option value="practical">Practical and actionable</option>
            <option value="theological">Deep and theological</option>
            <option value="personal">Personal and relational</option>
            <option value="scripture_focused">Scripture-focused</option>
          </select>
          {errors.preferred_style && (
            <p className="form-error">{errors.preferred_style.message}</p>
          )}
        </div>

        <div className="text-center pt-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary btn-lg"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Processing...
              </>
            ) : (
              <>
                Generate My 50 Selections & Prayer
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}


