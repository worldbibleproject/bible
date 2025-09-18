'use client';

import React from 'react';
import Link from 'next/link';
import { 
  HeartIcon, 
  UsersIcon, 
  BookOpenIcon, 
  VideoCameraIcon,
  MapPinIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export default function AboutPage() {
  const features = [
    {
      icon: SparklesIcon,
      title: 'AI-Powered Wizard',
      description: 'Get personalized spiritual guidance and Bible verse recommendations based on your unique journey.'
    },
    {
      icon: MapPinIcon,
      title: 'Church Finder',
      description: 'Discover churches in your area by denomination, location, and community preferences.'
    },
    {
      icon: UsersIcon,
      title: 'Mentor Matching',
      description: 'Connect with experienced mentors who can guide you through your spiritual journey.'
    },
    {
      icon: VideoCameraIcon,
      title: 'Video Calling',
      description: 'Schedule and join video calls with mentors for personalized spiritual guidance sessions.'
    },
    {
      icon: BookOpenIcon,
      title: 'Bible Integration',
      description: 'Access a comprehensive Bible verse database with powerful search and study tools.'
    },
    {
      icon: HeartIcon,
      title: 'Community',
      description: 'Join group sessions and connect with others on similar spiritual journeys.'
    }
  ];

  const stats = [
    { label: 'Active Users', value: '1,000+' },
    { label: 'Churches Listed', value: '500+' },
    { label: 'Mentors Available', value: '100+' },
    { label: 'Sessions Completed', value: '5,000+' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              About Evangelism App
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              A comprehensive platform designed to connect seekers with mentors, 
              help find churches, and provide AI-powered spiritual guidance for 
              your faith journey.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              To create a digital space where people can discover their faith, 
              connect with mentors, find their church community, and grow spiritually 
              through technology-enhanced guidance and support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-lg text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Features</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform offers a comprehensive suite of tools to support 
              your spiritual journey and help you connect with your faith community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Getting started is simple. Follow these steps to begin your 
              spiritual journey with us.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign Up</h3>
              <p className="text-gray-600">
                Create your account and tell us about your spiritual journey.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Take the Wizard</h3>
              <p className="text-gray-600">
                Complete our AI-powered assessment to get personalized recommendations.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect</h3>
              <p className="text-gray-600">
                Find mentors, churches, and community members who match your needs.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Grow</h3>
              <p className="text-gray-600">
                Schedule sessions, join groups, and continue your spiritual growth.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of people who are discovering their faith and 
            connecting with their spiritual community through our platform.
          </p>
          <div className="space-x-4">
            <Link
              href="/register"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 Evangelism App. All rights reserved.</p>
            <div className="mt-2 space-x-4">
              <Link href="/privacy" className="hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white">
                Terms of Service
              </Link>
              <Link href="/contact" className="hover:text-white">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
