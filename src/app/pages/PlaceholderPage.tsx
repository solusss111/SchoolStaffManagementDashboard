export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-lg border border-border p-8 text-center">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">Страница в разработке</p>
    </div>
  );
}
