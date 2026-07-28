// export default function DigitalUpdatesPanel({ style }) {
//     if (!style.updatesPanel) return null;
  
//     const { heading, intro, items } = style.updatesPanel;
  
//     return (
//       <div
//         className="mt-10 rounded-2xl p-6 sm:p-8"
//         style={{ backgroundColor: "#F7F8FA" }}
//       >
//         <div className="mb-1 flex items-center gap-2">
//           <span
//             className="inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
//             style={{ backgroundColor: "#2F7D1B" }}
//           >
//             New
//           </span>
//           <h2 className="text-xl font-bold sm:text-2xl" style={{ color: "#0B1830" }}>
//             {heading}
//           </h2>
//         </div>
//         <p className="mb-6 text-sm font-medium" style={{ color: "#0B1830" }}>
//           {intro}
//         </p>
  
//         <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
//           {items.map((item, i) => (
//             <div key={i} className="flex flex-col items-center text-center sm:items-center sm:textcenter">
//               <div
//                 className="mb-3 flex h-12 w-12 items-center justify-center rounded-full"
//                 style={{ backgroundColor: "#EFF5EE" }}
//               >
//                 <span style={{ color: "#2F7D1B" }}>{item.icon}</span>
//               </div>
//               <p className="text-sm leading-snug" style={{ color: "#0B1830" }}>
//                 {item.label}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }
export default function DigitalUpdatesPanel({ style }) {
  if (!style.updatesPanel) return null;

  const { heading } = style.updatesPanel;

  const items = [
    {
      title: "Read Anywhere",
      description: "Enjoy on desktop, tablet or mobile.",
      icon: <DeviceIcon />,
    },
    {
      title: "Interactive Experience",
      description: "Tap adverts to visit businesses directly.",
      icon: <LinkIcon />,
    },
    {
      title: "Latest Edition",
      description: "Read each new issue the moment it's published.",
      icon: <DocIcon />,
    },
  ];

  return (
    <div className="mt-10 rounded-2xl bg-[#F7F8FA] p-6 sm:p-8">
      <h2 className="mb-6 text-center text-xl font-bold text-[#0B1830] sm:text-2xl">
        Why go digital?
      </h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {items.map((item, i) => (
          <div
            key={i}
            className={`flex flex-col items-center text-center px-4 ${
              i > 0 ? "sm:border-l sm:border-[#D9E0E7]" : ""
            }`}
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center text-[#2F7D1B]">
              {item.icon}
            </div>
            <p className="mb-1 text-sm font-bold text-[#0B1830]">
              {item.title}
            </p>
            <p className="text-sm leading-snug text-[#657084]">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeviceIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="6" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="17" y="9" width="5" height="10" rx="1" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9.5 14.5l5-5M8 9a3.5 3.5 0 0 1 5-5l1 1M16 15a3.5 3.5 0 0 1-5 5l-1-1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 2h9l3 3v17H6V2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M15 2v3h3" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 12h6M9 15h6M9 9h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}