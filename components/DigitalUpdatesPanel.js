export default function DigitalUpdatesPanel({ style }) {
    if (!style.updatesPanel) return null;
  
    const { heading, intro, items } = style.updatesPanel;
  
    return (
      <div
        className="mt-10 rounded-2xl p-6 sm:p-8"
        style={{ backgroundColor: "#F7F8FA" }}
      >
        <div className="mb-1 flex items-center gap-2">
          <span
            className="inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
            style={{ backgroundColor: "#2F7D1B" }}
          >
            New
          </span>
          <h2 className="text-xl font-bold sm:text-2xl" style={{ color: "#0B1830" }}>
            {heading}
          </h2>
        </div>
        <p className="mb-6 text-sm font-medium" style={{ color: "#0B1830" }}>
          {intro}
        </p>
  
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center sm:items-center sm:textcenter">
              <div
                className="mb-3 flex h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: "#EFF5EE" }}
              >
                <span style={{ color: "#2F7D1B" }}>{item.icon}</span>
              </div>
              <p className="text-sm leading-snug" style={{ color: "#0B1830" }}>
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }