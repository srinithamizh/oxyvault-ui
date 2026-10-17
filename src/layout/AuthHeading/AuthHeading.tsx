export default function AuthHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-[25px] text-center">
      <h1 className="text-[27px]">{title}</h1>
      <p className="mt-[7px] text-[11px] text-muted">{subtitle}</p>
    </div>
  );
}
