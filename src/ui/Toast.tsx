export type ToastMessage = {
  text: string;
  className?: string;
};

interface IToastProps {
  messages: ToastMessage[];
}

export function Toast({ messages }: IToastProps) {
  return (
    <div className="toast">
      {messages.map(({ text, className }) => (
        <div className={`alert ${className}`}>
          <div>
            <span>{text}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
