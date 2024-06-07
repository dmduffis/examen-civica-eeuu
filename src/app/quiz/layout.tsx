export default function RootLayout({children}: {children: React.ReactNode;}) {
    return (
      <div className="flex flex-1 justify-center max-w-[800px]">
        {children}
    </div>
    );
  }