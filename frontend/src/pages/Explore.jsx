import Sidebar from "@/components/layout/Sidebar.jsx";

const Explore = () => {
  return (
    <div className="bg-black/95 flex text-white min-h-screen">
      <Sidebar />
      <main className="flex-1 w-full p-4 mx-auto flex flex-col gap-6 overflow-auto">
        <h1 className="text-2xl font-bold">Explore</h1>
        <p className="text-gray-400">Explore page content</p>
      </main>
    </div>
  );
};

export default Explore;
