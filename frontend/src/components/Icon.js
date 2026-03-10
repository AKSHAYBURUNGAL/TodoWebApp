import React from "react";

const ICONS = {
  clipboard: (
    <>
      <path d="M9 5.25A2.25 2.25 0 0 1 11.25 3h1.5A2.25 2.25 0 0 1 15 5.25" />
      <path d="M9 5.25h6" />
      <path d="M9 5.25H7.5A2.25 2.25 0 0 0 5.25 7.5V18A2.25 2.25 0 0 0 7.5 20.25h9A2.25 2.25 0 0 0 18.75 18V7.5a2.25 2.25 0 0 0-2.25-2.25H15" />
    </>
  ),
  calendarDay: (
    <>
      <path d="M8.25 2.75v3" />
      <path d="M15.75 2.75v3" />
      <path d="M3.75 7.25h16.5" />
      <path d="M4.5 5.75h15A1.5 1.5 0 0 1 21 7.25V18a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18V7.25a1.5 1.5 0 0 1 1.5-1.5Z" />
      <path d="M12 12h.01" fill="currentColor" stroke="none" />
      <path d="M12 15.5h.01" fill="currentColor" stroke="none" />
    </>
  ),
  calendarWeek: (
    <>
      <path d="M8.25 2.75v3" />
      <path d="M15.75 2.75v3" />
      <path d="M3.75 7.25h16.5" />
      <path d="M4.5 5.75h15A1.5 1.5 0 0 1 21 7.25V18a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18V7.25a1.5 1.5 0 0 1 1.5-1.5Z" />
      <path d="M7.5 11.25h9" />
      <path d="M7.5 15h9" />
    </>
  ),
  calendarMonth: (
    <>
      <path d="M8.25 2.75v3" />
      <path d="M15.75 2.75v3" />
      <path d="M3.75 7.25h16.5" />
      <path d="M4.5 5.75h15A1.5 1.5 0 0 1 21 7.25V18a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18V7.25a1.5 1.5 0 0 1 1.5-1.5Z" />
      <path d="M7.5 11.25h2.25v2.25H7.5z" fill="currentColor" stroke="none" />
      <path d="M10.875 11.25h2.25v2.25h-2.25z" fill="currentColor" stroke="none" />
      <path d="M14.25 11.25h2.25v2.25h-2.25z" fill="currentColor" stroke="none" />
      <path d="M7.5 14.625h2.25v2.25H7.5z" fill="currentColor" stroke="none" />
      <path d="M10.875 14.625h2.25v2.25h-2.25z" fill="currentColor" stroke="none" />
      <path d="M14.25 14.625h2.25v2.25h-2.25z" fill="currentColor" stroke="none" />
    </>
  ),
  dashboard: (
    <>
      <path d="M4.5 19.5h15" />
      <path d="M7.5 16.5v-5.25" />
      <path d="M12 16.5V8.25" />
      <path d="M16.5 16.5v-3.75" />
    </>
  ),
  analytics: (
    <>
      <path d="M4.5 19.5h15" />
      <path d="m6.75 14.25 4.5-4.5 3.75 3.75 3-6" />
      <path d="M18 7.5h.01" fill="currentColor" stroke="none" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.25" r="3.25" />
      <path d="M5.25 19.5a6.75 6.75 0 0 1 13.5 0" />
    </>
  ),
  logout: (
    <>
      <path d="M14.25 7.5V5.25A2.25 2.25 0 0 0 12 3H6.75A2.25 2.25 0 0 0 4.5 5.25v13.5A2.25 2.25 0 0 0 6.75 21H12a2.25 2.25 0 0 0 2.25-2.25V16.5" />
      <path d="M9.75 12h9" />
      <path d="m15.75 8.25 3.75 3.75-3.75 3.75" />
    </>
  ),
  edit: (
    <>
      <path d="m16.862 4.487 2.651 2.651" />
      <path d="M19.5 4.5a2.121 2.121 0 0 0-3 0L7.125 13.875 5.25 18.75l4.875-1.875L19.5 7.5a2.121 2.121 0 0 0 0-3Z" />
    </>
  ),
  trash: (
    <>
      <path d="M14.74 9 14.394 18m-4.788 0L9.26 9" />
      <path d="M3.75 6.75h16.5" />
      <path d="M8.25 6.75V5.25A1.5 1.5 0 0 1 9.75 3.75h4.5a1.5 1.5 0 0 1 1.5 1.5v1.5" />
      <path d="M18.75 6.75 18 19.5a1.5 1.5 0 0 1-1.5 1.5h-9a1.5 1.5 0 0 1-1.5-1.5l-.75-12.75" />
    </>
  ),
  plus: <path d="M12 5.25v13.5M5.25 12h13.5" />,
  chevronLeft: <path d="m14.25 18-6-6 6-6" />,
  chevronRight: <path d="m9.75 18 6-6-6-6" />,
  sparkles: (
    <>
      <path d="M12 3.75 13.575 8.4 18.25 10 13.575 11.6 12 16.25 10.425 11.6 5.75 10l4.675-1.6L12 3.75Z" />
      <path d="M18 4.5 18.6 6.15 20.25 6.75 18.6 7.35 18 9 17.4 7.35 15.75 6.75 17.4 6.15 18 4.5Z" />
    </>
  ),
  check: <path d="m5.25 12.75 4.5 4.5 9-9" />,
  circle: <circle cx="12" cy="12" r="7.25" />,
  target: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="2.25" />
      <path d="M12 2.25v2.25M12 19.5v2.25M21.75 12H19.5M4.5 12H2.25" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 7.5v4.875l3 1.875" />
    </>
  ),
  flag: (
    <>
      <path d="M6 20.25V4.5" />
      <path d="M6.75 5.25h8.625l-1.5 3 1.5 3H6.75" />
    </>
  ),
};

function Icon({
  name,
  size = 20,
  className = "",
  title,
  decorative = true,
  ...props
}) {
  const icon = ICONS[name];

  if (!icon) {
    return null;
  }

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={decorative ? "true" : undefined}
      role={decorative ? undefined : "img"}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {icon}
    </svg>
  );
}

export default Icon;
