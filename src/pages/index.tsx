import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type Habit = {
  id: string;
  name: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  streak: number;
  history: { date: string; value: number }[];
  color: string;
};

type DailyCheckIn = {
  date: string;
  habits: {
    habitId: string;
    value: number;
  }[];
};

const PersonalAnalyticsApp = () => {
  // Mock user data
  const [user, setUser] = useState({
    name: 'Alex Johnson',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    joinDate: '2023-01-15',
  });

  // Habit data
  const [habits, setHabits] = useState<Habit[]>([
    {
      id: 'sleep',
      name: 'Sleep',
      currentValue: 0,
      targetValue: 8,
      unit: 'hours',
      streak: 0,
      color: 'bg-indigo-500',
      history: [
        { date: '2023-05-01', value: 7.5 },
        { date: '2023-05-02', value: 8 },
        { date: '2023-05-03', value: 6.5 },
        { date: '2023-05-04', value: 7 },
        { date: '2023-05-05', value: 8.5 },
        { date: '2023-05-06', value: 9 },
        { date: '2023-05-07', value: 7 },
      ],
    },
    {
      id: 'water',
      name: 'Water Intake',
      currentValue: 0,
      targetValue: 8,
      unit: 'glasses',
      streak: 0,
      color: 'bg-blue-500',
      history: [
        { date: '2023-05-01', value: 7 },
        { date: '2023-05-02', value: 8 },
        { date: '2023-05-03', value: 6 },
        { date: '2023-05-04', value: 5 },
        { date: '2023-05-05', value: 8 },
        { date: '2023-05-06', value: 9 },
        { date: '2023-05-07', value: 7 },
      ],
    },
    {
      id: 'exercise',
      name: 'Exercise',
      currentValue: 0,
      targetValue: 30,
      unit: 'minutes',
      streak: 0,
      color: 'bg-green-500',
      history: [
        { date: '2023-05-01', value: 25 },
        { date: '2023-05-02', value: 30 },
        { date: '2023-05-03', value: 0 },
        { date: '2023-05-04', value: 15 },
        { date: '2023-05-05', value: 45 },
        { date: '2023-05-06', value: 60 },
        { date: '2023-05-07', value: 30 },
      ],
    },
    {
      id: 'screen-time',
      name: 'Screen Time',
      currentValue: 0,
      targetValue: 4,
      unit: 'hours',
      streak: 0,
      color: 'bg-yellow-500',
      history: [
        { date: '2023-05-01', value: 5 },
        { date: '2023-05-02', value: 4 },
        { date: '2023-05-03', value: 6 },
        { date: '2023-05-04', value: 7 },
        { date: '2023-05-05', value: 3 },
        { date: '2023-05-06', value: 2 },
        { date: '2023-05-07', value: 4 },
      ],
    },
  ]);

  const [dailyCheckIns, setDailyCheckIns] = useState<DailyCheckIn[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [notification, setNotification] = useState('');
  const [today] = useState(new Date().toISOString().split('T')[0]);
  const [lastCheckInDate, setLastCheckInDate] = useState<string | null>(null);
  const [theme, setTheme] = useState('light');

  // Check if today's check-in exists
  useEffect(() => {
    const todayCheckIn = dailyCheckIns.find(checkIn => checkIn.date === today);
    if (todayCheckIn) {
      setLastCheckInDate(today);
      // Update current values from today's check-in
      const updatedHabits = habits.map(habit => {
        const todayHabit = todayCheckIn.habits.find(h => h.habitId === habit.id);
        return todayHabit ? { ...habit, currentValue: todayHabit.value } : habit;
      });
      setHabits(updatedHabits);
    }
  }, [dailyCheckIns, today, habits]);

  // Calculate streaks
  useEffect(() => {
    const updatedHabits = habits.map(habit => {
      let streak = 0;
      let prevDate = new Date();

      // Sort history by date descending
      const sortedHistory = [...habit.history].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      for (const entry of sortedHistory) {
        const entryDate = new Date(entry.date);
        if (entry.value >= habit.targetValue * 0.9) { // 90% of target counts
          if (streak === 0 ||
            (prevDate.getTime() - entryDate.getTime()) <= 86400000) { // 1 day in ms
            streak++;
            prevDate = entryDate;
          } else {
            break;
          }
        } else {
          break;
        }
      }

      return { ...habit, streak };
    });

    setHabits(updatedHabits);
  }, [dailyCheckIns]);

  const handleCheckIn = () => {
    // Check if already checked in today
    if (lastCheckInDate === today) {
      setNotification('You have already checked in today!');
      setTimeout(() => setNotification(''), 3000);
      return;
    }

    const todayHabits = habits.map(habit => ({
      habitId: habit.id,
      value: habit.currentValue,
    }));

    const newCheckIn: DailyCheckIn = {
      date: today,
      habits: todayHabits,
    };

    setDailyCheckIns([...dailyCheckIns, newCheckIn]);
    setLastCheckInDate(today);
    setNotification('Daily check-in completed!');
    setTimeout(() => setNotification(''), 3000);
  };

  const updateHabitValue = (id: string, value: number) => {
    setHabits(
      habits.map(habit =>
        habit.id === id ? { ...habit, currentValue: value } : habit
      )
    );
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const getCompletionPercentage = (habit: Habit) => {
    return Math.min(Math.round((habit.currentValue / habit.targetValue) * 100), 100);
  };

  const getWeeklyAverage = (habit: Habit) => {
    const sum = habit.history.reduce((acc, entry) => acc + entry.value, 0);
    return (sum / habit.history.length).toFixed(1);
  };

  const getBestDay = (habit: Habit) => {
    const bestDay = habit.history.reduce((max, entry) =>
      entry.value > max.value ? entry : max, habit.history[0]);
    return {
      date: new Date(bestDay.date).toLocaleDateString('en-US', { weekday: 'long' }),
      value: bestDay.value,
    };
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Background pattern */}
      <div className={`fixed inset-0 ${theme === 'dark' ? 'opacity-10' : 'opacity-5'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-blue-100 to-purple-100"></div>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 px-4 py-2 rounded-md shadow-lg z-50 ${notification.includes('already') ? 'bg-yellow-500' : 'bg-green-500'
              } text-white`}
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <nav className={`relative z-10 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="flex-shrink-0 flex items-center"
              >
                <div className={`w-8 h-8 rounded-full ${theme === 'dark' ? 'bg-indigo-600' : 'bg-indigo-500'} flex items-center justify-center text-white font-bold`}>
                  H
                </div>
                <span className="ml-2 text-xl font-semibold">HabitHero</span>
              </motion.div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`${activeTab === 'dashboard' ? 'border-indigo-500 text-gray-900 text-indigo-500 ' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-indigo-500 dark:hover:text-gray-300'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ease-in-out `}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`${activeTab === 'analytics' ? 'border-indigo-500 text-gray-900 text-indigo-500 ' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-indigo-500  dark:hover:text-gray-300'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ease-in-out`}
                >
                  Analytics
                </button>
                <button
                  onClick={() => setActiveTab('habits')}
                  className={`${activeTab === 'habits' ? 'border-indigo-500 text-gray-900 text-indigo-500 ' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-indigo-500 dark:hover:text-gray-300'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ease-in-out`}
                >
                  My Habits
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={toggleTheme}
                className={`p-1 rounded-full ${theme === 'dark' ? 'text-yellow-300 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                {theme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="ml-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <img className="h-8 w-8 rounded-full" src={user.avatar} alt="User profile" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`mb-8 p-6 rounded-xl shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {user.name}!</h1>
              <p className={`mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {lastCheckInDate === today
                  ? "You've completed today's check-in. Keep up the good work!"
                  : "Ready to track your habits for today?"}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCheckIn}
              disabled={lastCheckInDate === today}
              className={`mt-4 sm:mt-0 px-6 py-2 rounded-lg font-medium ${lastCheckInDate === today
                ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'} text-white shadow-sm`}
            >
              {lastCheckInDate === today ? 'Checked In' : 'Daily Check-In'}
            </motion.button>
          </div>
        </motion.section>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {habits.map((habit, index) => (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  className={`p-6 rounded-xl shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{habit.name}</h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        Target: {habit.targetValue} {habit.unit}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${habit.streak > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                      {habit.streak} day streak
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{habit.currentValue} {habit.unit}</span>
                      <span>{getCompletionPercentage(habit)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div
                        className={`h-2.5 rounded-full ${habit.color}`}
                        style={{ width: `${getCompletionPercentage(habit)}%` }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`p-6 rounded-xl shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
              >
                <h3 className="text-lg font-semibold mb-4">Weekly Progress</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={habits[0].history.map((entry, i) => ({
                        date: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' }),
                        Sleep: habits[0].history[i].value,
                        Water: habits[1].history[i].value,
                        Exercise: habits[2].history[i].value,
                        'Screen Time': habits[3].history[i].value,
                      }))}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4b5563' : '#e5e7eb'} />
                      <XAxis dataKey="date" stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                      <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                      <Tooltip
                        contentStyle={theme === 'dark' ? {
                          backgroundColor: '#1f2937',
                          borderColor: '#374151',
                          borderRadius: '0.5rem'
                        } : {
                          backgroundColor: 'white',
                          borderColor: '#e5e7eb',
                          borderRadius: '0.5rem'
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="Sleep" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="Water" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="Exercise" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="Screen Time" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`p-6 rounded-xl shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
              >
                <h3 className="text-lg font-semibold mb-4">Today's Progress</h3>
                <div className="space-y-4">
                  {habits.map(habit => (
                    <div key={habit.id}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{habit.name}</span>
                        <span className="text-sm">
                          {habit.currentValue} / {habit.targetValue} {habit.unit}
                        </span>
                      </div>
                      <div className="relative pt-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <input
                              type="range"
                              min="0"
                              max={habit.targetValue * 1.5} // Allows exceeding target slightly
                              value={habit.currentValue}
                              onChange={(e) => updateHabitValue(habit.id, parseFloat(e.target.value))}
                              className={`w-full h-2 rounded-lg appearance-none cursor-pointer dark:bg-gray-700  bg-gray ${habit.color.replace('bg-', 'accent-')}`}
                            />
                          </div>
                          <div className="ml-2 w-12 text-right">
                            <span className="text-xs font-semibold inline-block">
                              {getCompletionPercentage(habit)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Analytics */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className={`mb-8 p-6 rounded-xl shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className="text-xl font-bold mb-6">Habit Analytics</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {habits.map(habit => (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                  >
                    <h3 className="font-semibold mb-4 flex items-center">
                      <span className={`w-3 h-3 rounded-full ${habit.color} mr-2`}></span>
                      {habit.name}
                    </h3>

                    <div className="h-48 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={habit.history.map(entry => ({
                            date: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' }),
                            value: entry.value,
                          }))}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4b5563' : '#e5e7eb'} />
                          <XAxis dataKey="date" stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                          <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                          <Tooltip
                            contentStyle={theme === 'dark' ? {
                              backgroundColor: '#1f2937',
                              borderColor: '#374151',
                              borderRadius: '0.5rem'
                            } : {
                              backgroundColor: 'white',
                              borderColor: '#e5e7eb',
                              borderRadius: '0.5rem'
                            }}
                          />
                          <Bar
                            dataKey="value"
                            fill={habit.color.replace('bg-', '').split('-')[0]}
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'}`}>
                        <div className="text-xs opacity-70">Weekly Avg</div>
                        <div className="font-medium">{getWeeklyAverage(habit)} {habit.unit}</div>
                      </div>
                      <div className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'}`}>
                        <div className="text-xs opacity-70">Best Day</div>
                        <div className="font-medium">{getBestDay(habit).date}: {getBestDay(habit).value} {habit.unit}</div>
                      </div>
                      <div className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'}`}>
                        <div className="text-xs opacity-70">Current Streak</div>
                        <div className="font-medium">{habit.streak} days</div>
                      </div>
                      <div className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'}`}>
                        <div className="text-xs opacity-70">Today</div>
                        <div className="font-medium">{habit.currentValue} {habit.unit}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Habits */}
        {activeTab === 'habits' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className={`mb-8 p-6 rounded-xl shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">My Habits</h2>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">
                  + Add New Habit
                </button>
              </div>

              <div className="space-y-4">
                {habits.map(habit => (
                  <motion.div
                    key={habit.id}
                    whileHover={{ scale: 1.01 }}
                    className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} shadow-sm`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{habit.name}</h3>
                        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          Target: {habit.targetValue} {habit.unit} per day
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${habit.streak > 3 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                        {habit.streak > 3 ? '🔥 Hot streak!' : `${habit.streak} day streak`}
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Today: {habit.currentValue} {habit.unit}</span>
                        <span>{getCompletionPercentage(habit)}% of target</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-600">
                        <div
                          className={`h-2.5 rounded-full ${habit.color}`}
                          style={{ width: `${getCompletionPercentage(habit)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 rounded">
                          History
                        </button>
                        <button className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 rounded">
                          Edit
                        </button>
                      </div>
                      <div className="text-xs">
                        Last week avg: {getWeeklyAverage(habit)} {habit.unit}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className={`relative z-10 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full ${theme === 'dark' ? 'bg-indigo-600' : 'bg-indigo-500'} flex items-center justify-center text-white font-bold text-sm`}>
                H
              </div>
              <span className="ml-2 text-sm">HabitHero © 2023</span>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className={`text-sm ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                Privacy
              </a>
              <a href="#" className={`text-sm ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                Terms
              </a>
              <a href="#" className={`text-sm ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`relative rounded-xl shadow-xl max-w-md w-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Settings</h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Appearance</h4>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setTheme('light')}
                        className={`px-4 py-2 rounded-lg ${theme === 'light' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                      >
                        Light
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                      >
                        Dark
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Notifications</h4>
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="form-checkbox h-5 w-5 text-indigo-600 rounded" defaultChecked />
                        <span className="text-sm">Daily reminder to check in</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Account</h4>
                    <div className="flex items-center space-x-4">
                      <img className="h-12 w-12 rounded-full" src={user.avatar} alt="User avatar" />
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm opacity-70">Member since {new Date(user.joinDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowSettings(false)}
                    className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PersonalAnalyticsApp;