// app/components/StripePattern.tsx
export default function StripePattern() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute left-0 top-0 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-primary/10" />
      <div className="absolute bottom-0 right-0 h-[300px] w-[500px] translate-x-1/2 translate-y-1/2 rotate-45 bg-primary/10" />
    </div>
  );
}