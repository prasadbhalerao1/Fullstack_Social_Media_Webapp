/**
 * TypingIndicator — animated three-dot typing indicator (WhatsApp style)
 */
const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-3 py-2 bg-neutral-800 rounded-2xl rounded-bl-none w-fit">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce"
        style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.9s" }}
      />
    ))}
  </div>
);

export default TypingIndicator;
