"use client";
import React from "react";
import AdminLayout from "@/app/components/admin/AdminLayout";
import { LucideStar, LucideCheck, LucideX, LucideEye, LucideEyeOff } from "lucide-react";

type Review = {
  id: string;
  customerName: string;
  email: string;
  vehicleService: string;
  rating: number;
  comment: string;
  date: string;
  publishedToLanding: boolean;
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = React.useState<Review[]>(() => {
    // Load from localStorage or use mock data
    try {
      const raw = localStorage.getItem('customerReviews');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [
      {
        id: 'r1',
        customerName: 'John Doe',
        email: 'john@example.com',
        vehicleService: 'Oil Change',
        rating: 5,
        comment: 'Excellent service! Very professional and quick.',
        date: '2025-10-15',
        publishedToLanding: false
      },
      {
        id: 'r2',
        customerName: 'Jane Smith',
        email: 'jane@example.com',
        vehicleService: 'Brake Inspection',
        rating: 4,
        comment: 'Good service, but had to wait a bit longer than expected.',
        date: '2025-10-20',
        publishedToLanding: false
      },
      {
        id: 'r3',
        customerName: 'Mike Johnson',
        email: 'mike@example.com',
        vehicleService: 'Engine Diagnostic',
        rating: 5,
        comment: 'Amazing work! Found the issue quickly and fixed it perfectly.',
        date: '2025-10-22',
        publishedToLanding: true
      }
    ];
  });

  React.useEffect(() => {
    localStorage.setItem('customerReviews', JSON.stringify(reviews));
  }, [reviews]);

  const publishToLanding = (reviewId: string) => {
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;

    // Add to published testimonials
    try {
      const raw = localStorage.getItem('publishedTestimonials');
      const arr = raw ? JSON.parse(raw) : [];
      arr.unshift({ 
        quote: review.comment, 
        name: review.customerName, 
        service: review.vehicleService 
      });
      localStorage.setItem('publishedTestimonials', JSON.stringify(arr));
      
      // Update review status
      setReviews(prev => prev.map(r => 
        r.id === reviewId ? { ...r, publishedToLanding: true } : r
      ));
      
      alert('Review published to landing page successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to publish review');
    }
  };

  const unpublishFromLanding = (reviewId: string) => {
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;

    // Remove from published testimonials
    try {
      const raw = localStorage.getItem('publishedTestimonials');
      const arr = raw ? JSON.parse(raw) : [];
      const filtered = arr.filter((t: any) => 
        !(t.name === review.customerName && t.quote === review.comment)
      );
      localStorage.setItem('publishedTestimonials', JSON.stringify(filtered));
      
      // Update review status
      setReviews(prev => prev.map(r => 
        r.id === reviewId ? { ...r, publishedToLanding: false } : r
      ));
      
      alert('Review unpublished from landing page');
    } catch (e) {
      console.error(e);
    }
  };

  const deleteReview = (reviewId: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      setReviews(prev => prev.filter(r => r.id !== reviewId));
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

  const publishedCount = reviews.filter(r => r.publishedToLanding).length;
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <AdminLayout activeTab="Reviews Management">
      <div className="flex flex-wrap justify-between gap-3 mb-6">
        <div className="flex min-w-72 flex-col gap-3">
          <p className="text-[#181111] text-4xl font-black leading-tight tracking-[-0.033em]">Reviews Management</p>
          <p className="text-gray-500 text-base font-normal leading-normal">
            Manage customer reviews and select which ones to display on the landing page.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Reviews</p>
              <p className="text-3xl font-bold text-[#181111] mt-1">{reviews.length}</p>
            </div>
            <div className="size-12 rounded-full bg-blue-100 flex items-center justify-center">
              <LucideStar className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Published</p>
              <p className="text-3xl font-bold text-[#181111] mt-1">{publishedCount}</p>
            </div>
            <div className="size-12 rounded-full bg-green-100 flex items-center justify-center">
              <LucideEye className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Average Rating</p>
              <p className="text-3xl font-bold text-[#181111] mt-1">{averageRating}</p>
            </div>
            <div className="size-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <LucideStar className="text-yellow-600 fill-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-[#181111] mb-4">All Customer Reviews</h2>
        
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <LucideStar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No reviews yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <div 
                key={review.id} 
                className={`border rounded-lg p-4 ${review.publishedToLanding ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-[#181111]">{review.customerName}</h3>
                      {renderStars(review.rating)}
                      {review.publishedToLanding && (
                        <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full flex items-center gap-1">
                          <LucideCheck className="w-3 h-3" /> Published
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Service:</span> {review.vehicleService}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Email:</span> {review.email}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">Date:</span> {review.date}
                    </p>
                    <p className="text-gray-800 italic">"{review.comment}"</p>
                  </div>
                </div>

                <div className="flex gap-2 justify-end border-t pt-3 mt-3">
                  {!review.publishedToLanding ? (
                    <button
                      onClick={() => publishToLanding(review.id)}
                      className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 flex items-center gap-2"
                    >
                      <LucideEye className="w-4 h-4" />
                      Publish to Landing
                    </button>
                  ) : (
                    <button
                      onClick={() => unpublishFromLanding(review.id)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 flex items-center gap-2"
                    >
                      <LucideEyeOff className="w-4 h-4" />
                      Unpublish
                    </button>
                  )}
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2"
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
    </AdminLayout>
  );
}
