'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Send,
  CheckCircle,
  MessageSquare,
  Users,
  Wrench,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Shield,
} from 'lucide-react';

import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';
import { useAuth } from '../../context/AuthContext';

export default function FeedbackPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState('service');
  const [sentiment, setSentiment] = useState<'positive' | 'negative' | null>(null);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Redirect to home a few seconds after submission to show the thank-you state
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | null = null;
    if (submitted) {
      t = setTimeout(() => {
        router.push('/');
      }, 3000);
    }
    return () => {
      if (t) clearTimeout(t);
    };
  }, [submitted, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Replace this with your real API call (authenticated if needed)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSubmitted(true);
    setIsLoading(false);

    // reset form after short delay so user sees thank you message
    setTimeout(() => {
      setRating(0);
      setMessage('');
      setEmail('');
      setFeedbackType('service');
      setSentiment(null);
      setSubmitted(false);
    }, 4000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600" />
      </div>
    );
  }

  if (!user) return null;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-gray-200"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-20 animate-pulse" />
              <CheckCircle className="w-20 h-20 text-red-600" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Thank You!</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Your feedback has been received and will help us improve your GearUp experience. We truly appreciate your
              input!
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex gap-2 justify-center text-sm text-gray-500"
            >
              <span>Redirecting you back</span>
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              >
                ...
              </motion.span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const feedbackCategories = [
    {
      value: 'service',
      label: 'Service Quality',
      icon: Wrench,
    },
    {
      value: 'staff',
      label: 'Staff & Support',
      icon: Users,
    },
    {
      value: 'facility',
      label: 'Facility',
      icon: MessageSquare,
    },
  ];

  const selectedCategory = feedbackCategories.find((cat) => cat.value === feedbackType);
  const CategoryIcon = selectedCategory?.icon || Wrench;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLoginClick={() => {}} />

      <div className="mt-12 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
                className="p-3 bg-red-600 rounded-full"
              >
                <Star className="w-8 h-8 text-white" />
              </motion.div>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-3">Share Your Feedback</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Help us improve your GearUp experience. Your feedback drives our commitment to excellence.
            </p>
          </motion.div>

          {/* Main Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Feedback Type Selection */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <label className="block text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-red-600" />
                  What is your feedback about?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {feedbackCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <motion.button
                        key={category.value}
                        type="button"
                        onClick={() => setFeedbackType(category.value)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative p-4 rounded-xl font-semibold transition-all duration-300 ${
                          feedbackType === category.value
                            ? 'bg-red-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                        }`}
                      >
                        <Icon className="w-5 h-5 mx-auto mb-2" />
                        {category.label}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Sentiment Selection */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <label className="block text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5 text-red-600" />
                  Overall Sentiment
                </label>
                <div className="flex gap-4">
                  {Object.entries({
                    positive: 'Positive',
                    negative: 'Needs Improvement',
                  }).map(([value, label]) => {
                    const Icon = value === 'positive' ? ThumbsUp : ThumbsDown;
                    return (
                      <motion.button
                        key={value}
                        type="button"
                        onClick={() => setSentiment(value as 'positive' | 'negative')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex-1 p-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                          sentiment === value
                            ? 'bg-red-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {label}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-50 rounded-xl p-6 border border-gray-200"
              >
                <label className="block text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-red-600" />
                  How would you rate your experience?
                </label>
                <div className="flex gap-3 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className="transition-transform duration-200"
                    >
                      <Star
                        size={48}
                        className={`transition-all duration-200 ${
                          star <= (hoveredRating || rating) ? 'fill-red-600 text-red-600 drop-shadow-lg' : 'text-gray-300'
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>
                <AnimatePresence>
                  {rating > 0 && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-center text-sm font-semibold text-gray-700 mt-4"
                    >
                      {rating === 5 && "Excellent! We're thrilled!"}
                      {rating === 4 && 'Great! Thank you!'}
                      {rating === 3 && 'Good feedback!'}
                      {rating === 2 && "We'll improve!"}
                      {rating === 1 && 'We appreciate your honesty!'}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Message Section */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <label htmlFor="message" className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-red-600" />
                  Tell us more (optional)
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 500))}
                  placeholder="Share your thoughts, suggestions, or concerns..."
                  rows={5}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none transition-all duration-300 hover:border-gray-300"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">{message.length}/500 characters</p>
                  {message.length > 400 && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-600 font-semibold">
                      Almost there!
                    </motion.span>
                  )}
                </div>
              </motion.div>

              {/* Contact Info */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  Contact Information (optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm transition-all duration-300 hover:border-gray-300"
                />
                <p className="text-xs text-gray-600 mt-2">We'll only use this to follow up on your feedback</p>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading || rating === 0}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 text-lg ${
                  isLoading || rating === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-red-600 text-white hover:shadow-xl hover:bg-red-700'
                }`}
              >
                {isLoading ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Submit Feedback
                  </>
                )}
              </motion.button>

              <p className="text-xs text-gray-500 text-center font-medium">⭐ Please rate your experience to submit feedback</p>
            </form>
          </motion.div>

          {/* Info Cards */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries({
              QuickResponse: 'We review all feedback within 24 hours',
              YourPrivacy: 'Your information is secure and confidential',
              MakeADifference: 'Your feedback helps us serve you better',
            }).map(([key, description], index) => {
              const Icon = key === 'QuickResponse' ? Clock : key === 'YourPrivacy' ? Shield : Star;
              return (
                <motion.div key={key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 + index * 0.1 }} whileHover={{ y: -5 }} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                  <div className="w-12 h-12 rounded-lg bg-red-600 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{key}</h3>
                  <p className="text-sm text-gray-600">{description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
