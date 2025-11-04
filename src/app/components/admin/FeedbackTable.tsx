// app/components/admin/FeedbackTable.tsx
'use client';
import { Star, Trash2, CheckCircle } from 'lucide-react';

const mockFeedbacks = [
    { id: 'rev_001', customer: 'Sarah J.', rating: 5, comment: "The real-time progress tracker is a game-changer...", isFeatured: true },
    { id: 'rev_002', customer: 'David L.', rating: 5, comment: "Booking an appointment took less than a minute on their mobile-friendly site...", isFeatured: true },
    { id: 'rev_003', customer: 'Emily R.', rating: 4, comment: "Good service, but the waiting area could use better WiFi.", isFeatured: false },
    { id: 'rev_004', customer: 'Mark T.', rating: 5, comment: "Professional, fast, and transparent. The best service I've ever had.", isFeatured: true },
];

export default function FeedbackTable() {
    return (
        <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs text-muted-foreground uppercase">
                        <tr>
                            <th className="px-4 py-3 font-medium">Customer</th>
                            <th className="px-4 py-3 font-medium">Rating</th>
                            <th className="px-4 py-3 font-medium">Comment</th>
                            <th className="px-4 py-3 font-medium text-center">Featured</th>
                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {mockFeedbacks.map((fb) => (
                            <tr key={fb.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium">{fb.customer}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center">
                                        {[...Array(fb.rating)].map((_, i) => <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />)}
                                        {[...Array(5 - fb.rating)].map((_, i) => <Star key={i} className="h-4 w-4 text-gray-300" />)}
                                    </div>
                                </td>
                                <td className="px-4 py-3 max-w-sm truncate text-muted-foreground">{fb.comment}</td>
                                <td className="px-4 py-3 text-center">
                                    <button className={`p-1 rounded-full ${fb.isFeatured ? 'text-green-500 bg-green-100' : 'text-gray-300 hover:bg-gray-100'}`}>
                                        <CheckCircle className="h-5 w-5" />
                                    </button>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button className="p-1 rounded-full text-muted-foreground hover:bg-red-50 hover:text-primary">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
