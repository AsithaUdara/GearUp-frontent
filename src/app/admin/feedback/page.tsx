// app/admin/feedback/page.tsx
'use client';
import { motion } from 'framer-motion';
import FeedbackTable from '@/app/components/admin/FeedbackTable';

export default function FeedbackPage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h1 className="font-heading text-3xl font-bold">Customer Feedback</h1>
            <p className="mt-1 text-muted-foreground">Review, feature, and manage customer testimonials for the landing page.</p>

            <div className="mt-8">
                <FeedbackTable />
            </div>
        </motion.div>
    );
}
