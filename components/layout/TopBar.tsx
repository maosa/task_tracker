interface TopBarProps {
  title?: string
  userInitials?: string
  userFullName?: string
}

export default function TopBar({ title, userInitials = '?', userFullName }: TopBarProps) {
  return (
    <header className="flex items-center justify-between h-12 px-4 bg-white border-b border-[#DADADA] flex-shrink-0">
      {title && (
        <h1 className="text-sm font-medium text-[#19153F]">{title}</h1>
      )}
      {!title && <span />}
      <div
        className="w-8 h-8 rounded-full bg-[#38308F] text-white text-xs font-medium flex items-center justify-center select-none flex-shrink-0"
        title={userFullName}
        aria-label={userFullName ? `Signed in as ${userFullName}` : 'User avatar'}
      >
        {userInitials}
      </div>
    </header>
  )
}
