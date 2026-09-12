import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

export default function TestimonialsSection() {
  const { reviews } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    rating: '5',
    review_text: ''
  });

  const approvedReviews = (reviews || []).filter(r => r.status === 'APPROVED');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSubmittedMessage('Thank you! Your review has been submitted for admin moderation.');
        setFormData({ name: '', location: '', rating: '5', review_text: '' });
      } else {
        setSubmittedMessage('Failed to submit review. Please try again.');
      }
    } catch (err) {
      setSubmittedMessage('Error submitting review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="testimonials" className="py-20 md:py-28 max-w-7xl mx-auto px-4 md:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-accent-gold mb-3 block font-semibold">
            Patron Voices
          </span>
          <h2 className="font-headline text-3xl sm:text-4xl font-bold text-[#F9F6F0]">
            Trusted by Generations
          </h2>
        </div>
        <button
          onClick={() => {
            setSubmittedMessage('');
            setModalOpen(true);
          }}
          className="mt-4 md:mt-0 border border-accent-gold text-accent-gold px-6 py-3 rounded-lg text-xs uppercase tracking-widest hover:bg-accent-gold hover:text-[#121212] font-bold transition-all"
        >
          Write a Review
        </button>
      </div>

      {/* Review Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {approvedReviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-[#181818] p-8 border border-[#2A2A2A] rounded-2xl flex flex-col justify-between hover:border-accent-gold/40 transition-colors"
          >
            <div>
              <div className="flex text-accent-gold mb-4">
                {[...Array(rev.rating || 5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-[18px]">
                    star
                  </span>
                ))}
              </div>
              <p className="font-body text-sm text-[#F5F2EB]/80 mb-6 font-light italic leading-relaxed">
                "{rev.review_text}"
              </p>
            </div>
            <div className="pt-4 border-t border-[#2A2A2A]">
              <h4 className="font-headline font-bold text-[#F9F6F0] text-base">
                {rev.name}
              </h4>
              <span className="text-xs text-[#F5F2EB]/50">{rev.location || 'Patron'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Review Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1C1B1A] border border-[#2A2A2A] max-w-lg w-full p-6 sm:p-8 rounded-2xl relative shadow-2xl">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-[#F5F2EB]/60 hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="font-headline text-2xl font-bold text-[#F9F6F0] mb-2">
              Submit Your Review
            </h3>
            <p className="text-xs text-[#F5F2EB]/60 mb-6">
              Your feedback will be submitted to our admin team for moderation before appearing on the atelier website.
            </p>

            {submittedMessage ? (
              <div className="p-4 bg-accent-gold/10 border border-accent-gold/40 rounded-xl text-center">
                <p className="text-sm text-accent-gold font-medium mb-4">{submittedMessage}</p>
                <button
                  onClick={() => setModalOpen(false)}
                  className="bg-accent-gold text-[#121212] font-bold px-6 py-2 rounded-lg text-xs uppercase tracking-wider"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#F5F2EB]/70 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#F5F2EB]/70 mb-1">
                    Location / Town
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
                    placeholder="e.g. Chathencode, Nadaikkavu"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#F5F2EB]/70 mb-1">
                    Rating (Stars)
                  </label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
                  >
                    <option value="5">5 Stars - Exceptional Craftsmanship</option>
                    <option value="4">4 Stars - Very Satisfied</option>
                    <option value="3">3 Stars - Good Experience</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#F5F2EB]/70 mb-1">
                    Your Review *
                  </label>
                  <textarea
                    required
                    rows="3"
                    value={formData.review_text}
                    onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                    className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
                    placeholder="Share your experience..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-accent-gold text-[#121212] font-bold py-3.5 rounded-lg text-xs uppercase tracking-widest hover:bg-supporting-beige transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit for Moderation'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
