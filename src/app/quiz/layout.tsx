export default function RootLayout({children}: {children: React.ReactNode;}) {
    return (
      <div className="flex flex-1 justify-center w-full max-w-[800px] bg-green-500">
        {children}
    </div>
    );
  }