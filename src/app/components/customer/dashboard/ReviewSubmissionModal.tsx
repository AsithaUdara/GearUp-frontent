"use client";
import React from "react";
import { LucideStar, LucideX } from "lucide-react";

type ReviewSubmissionModalProps = {
  open: boolean;
  billId: string;
  vehicleService: string;
  onCloseAction: () => void;
  onSubmitAction: (review: { rating: number; comment: string }) => void;
};

export default function ReviewSubmissionModal({
  open,
  billId,
  vehicleService,
  onCloseAction,
  onSubmitAction,
}: ReviewSubmissionModalProps) {
  const [rating, setRating] = React.useState(0);
  const [hoveredRating, setHoveredRating] = React.useState(0);
  const [comment, setComment] = React.useState("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }
    if (comment.trim().length < 10) {
      alert("Please write a comment with at least 10 characters");
      return;
    }
    onSubmitAction({ rating, comment });
    setRating(0);
    setComment("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onCloseAction}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <LucideX className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-[#181111] mb-2">Submit Your Review</h2>
        <p className="text-gray-600 text-sm mb-6">
          Help us improve by sharing your experience with our service
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service: <span className="text-primary font-bold">{vehicleService}</span>
            </label>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Rate your experience
            </label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <LucideStar
                    className={`w-10 h-10 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-gray-600 mt-2">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your comments
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={4}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum 10 characters ({comment.length}/10)
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCloseAction}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90"
            >
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
