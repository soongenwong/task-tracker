import TaskList from '../components/TaskList';

export default function Home() {
  return (
    <div className="font-sans min-h-screen p-8 pb-20 sm:p-20">
      <header className="max-w-2xl mx-auto mb-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Task Tracker</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your effortless path to a more productive day
        </p>
      </header>

      <TaskList />
    </div>
  );
}
