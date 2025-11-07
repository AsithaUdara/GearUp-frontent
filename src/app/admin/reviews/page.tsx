"use client";
import React from "react";
import { motion } from "framer-motion";
import { LucideStar, LucideEye, LucideEyeOff, LucideX, LucideCheck, LucideAlertCircle } from "lucide-react";
import { getAllReviews, publishReview, unpublishReview, deleteReview as deleteReviewAPI, getReviewStats } from "@/lib/api/reviewService";
import type { CustomerReview, ReviewStatsDTO, ReviewStatus } from "@/types/payment";

type FilterTab = 'all' | 'pending' | 'published';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = React.useState<CustomerReview[]>([]);
  const [stats, setStats] = React.useState<ReviewStatsDTO | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<FilterTab>('all');
  const [processingId, setProcessingId] = React.useState<string | null>(null);
  const [mounted, setMounted] = React.useState(false);

  // Fetch reviews and stats from API
  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [reviewsData, statsData] = await Promise.all([
        getAllReviews(),
        getReviewStats()
      ]);
      
      setReviews(reviewsData);
      setStats(statsData);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    setMounted(true);
    fetchReviews();
  }, []);

  const handlePublish = async (reviewId: string) => {
    if (processingId) return;
    
    setProcessingId(reviewId);
    try {
      await publishReview(reviewId);
      await fetchReviews(); // Refresh data
      alert('Review published to landing page successfully!');
    } catch (err: any) {
      console.error('Error publishing review:', err);
      alert(err.message || 'Failed to publish review');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUnpublish = async (reviewId: string) => {
    if (processingId) return;
    
    setProcessingId(reviewId);
    try {
      await unpublishReview(reviewId);
      await fetchReviews(); // Refresh data
      alert('Review unpublished from landing page');
    } catch (err: any) {
      console.error('Error unpublishing review:', err);
      alert(err.message || 'Failed to unpublish review');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (processingId) return;
    
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }
    
    setProcessingId(reviewId);
    try {
      await deleteReviewAPI(reviewId);
      await fetchReviews(); // Refresh data
      alert('Review deleted successfully');
    } catch (err: any) {
      console.error('Error deleting review:', err);
      alert(err.message || 'Failed to delete review');
    } finally {
      setProcessingId(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <LucideStar 
            key={star} 
            className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const filteredReviews = reviews.filter(review => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return review.status === 'PENDING';
    if (activeTab === 'published') return review.status === 'PUBLISHED';
    return true;
  });

  // Prevent hydration mismatch - don't render until client-side mounted
  if (!mounted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-heading text-3xl font-bold text-foreground">Reviews Management</h1>
        <p className="mt-1 text-muted-foreground">
          Manage customer reviews and select which ones to display on the landing page.
        </p>
        <div className="mt-8 text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading reviews...</p>
        </div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-heading text-3xl font-bold text-foreground">Reviews Management</h1>
        <p className="mt-1 text-muted-foreground">
          Manage customer reviews and select which ones to display on the landing page.
        </p>
        <div className="mt-8 text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading reviews...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-heading text-3xl font-bold text-foreground">Reviews Management</h1>
        <p className="mt-1 text-muted-foreground">
          Manage customer reviews and select which ones to display on the landing page.
        </p>
        <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 text-red-800">
            <LucideAlertCircle className="w-6 h-6" />
            <div>
              <p className="font-medium">Error loading reviews</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchReviews}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="font-heading text-3xl font-bold text-foreground">Reviews Management</h1>
      <p className="mt-1 text-muted-foreground">
        Manage customer reviews and select which ones to display on the landing page.
      </p>

      {/* Stats Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="rounded-lg border border-border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <p className="font-body text-sm font-medium text-muted-foreground">Total Reviews</p>
            <LucideStar className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-2 font-heading text-4xl font-bold text-foreground">{reviews.length}</p>
        </div>

        <div className="rounded-lg border border-border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <p className="font-body text-sm font-medium text-muted-foreground">Pending</p>
            <LucideAlertCircle className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="mt-2 font-heading text-4xl font-bold text-foreground">{stats?.pendingCount || 0}</p>
        </div>

        <div className="rounded-lg border border-border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <p className="font-body text-sm font-medium text-muted-foreground">Published</p>
            <LucideEye className="h-5 w-5 text-green-500" />
          </div>
          <p className="mt-2 font-heading text-4xl font-bold text-foreground">{stats?.publishedCount || 0}</p>
        </div>

        <div className="rounded-lg border border-border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <p className="font-body text-sm font-medium text-muted-foreground">Average Rating</p>
            <LucideStar className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          </div>
          <p className="mt-2 font-heading text-4xl font-bold text-foreground">{stats?.averageRating.toFixed(1) || '0.0'}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mt-6 flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'all'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All ({reviews.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'pending'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Pending ({stats?.pendingCount || 0})
        </button>
        <button
          onClick={() => setActiveTab('published')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'published'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Published ({stats?.publishedCount || 0})
        </button>
      </div>

      {/* Reviews List */}
      <div className="mt-6 rounded-lg border border-border bg-white p-6 shadow-sm">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <LucideStar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No {activeTab !== 'all' ? activeTab : ''} reviews yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map(review => (
              <div 
                key={review.id} 
                className={`border rounded-lg p-4 ${review.status === 'PUBLISHED' ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-[#181111]">{review.customerName}</h3>
                      {renderStars(review.rating)}
                      {review.status === 'PUBLISHED' ? (
                        <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full flex items-center gap-1">
                          <LucideCheck className="w-3 h-3" /> Published
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full flex items-center gap-1">
                          <LucideAlertCircle className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Service:</span> {review.serviceName}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Email:</span> {review.customerEmail}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">Submitted:</span> {new Date(review.submittedDate).toLocaleDateString()}
                    </p>
                    <p className="text-gray-800 italic">"{review.reviewText}"</p>
                  </div>
                </div>

                <div className="flex gap-2 justify-end border-t pt-3 mt-3">
                  {review.status === 'PENDING' ? (
                    <button
                      onClick={() => handlePublish(review.id)}
                      disabled={processingId === review.id}
                      className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === review.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Publishing...
                        </>
                      ) : (
                        <>
                          <LucideEye className="w-4 h-4" />
                          Publish to Landing
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnpublish(review.id)}
                      disabled={processingId === review.id}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === review.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Unpublishing...
                        </>
                      ) : (
                        <>
                          <LucideEyeOff className="w-4 h-4" />
                          Unpublish
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={processingId === review.id}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LucideX className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
