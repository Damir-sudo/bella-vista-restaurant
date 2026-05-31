interface AdminOrderDetailProps {
  params: { id: string };
}

/** Admin order detail (Phase 1 skeleton). Phase 7: items, totals, status stepper. */
export default function AdminOrderDetailPage({ params }: AdminOrderDetailProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold">Order {params.id}</h1>
      <p className="mt-4 text-muted-foreground">Order detail and status controls will live here.</p>
    </div>
  );
}
