/**
 * Chip compacto de evento para uso no calendário (grades dia/semana/mês).
 */
export default function EventChip({ event: ev, getCategory, getTag, compact = false, onClick }) {
  const cat = getCategory(ev.categoryId);
  const tags = (ev.tagIds || [])
    .map((id) => getTag(id))
    .filter(Boolean);

  return (
    <div
      key={ev.id}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(ev);
      }}
      className={`rounded text-white truncate flex items-center justify-between gap-1 cursor-pointer hover:opacity-90 ${
        compact ? 'text-xs px-2 py-1' : 'text-sm px-2 py-1.5'
      }`}
      style={{ backgroundColor: ev.color || cat.color }}
    >
      <span className="truncate">
        {ev.isRequirement && <b>REQ: </b>}
        {ev.title}
      </span>
      {tags.length > 0 && (
        <span className="flex shrink-0 gap-0.5">
          {tags.slice(0, 2).map((t) => (
            <span
              key={t.id}
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: t.color }}
              title={t.name}
            />
          ))}
        </span>
      )}
    </div>
  );
}
