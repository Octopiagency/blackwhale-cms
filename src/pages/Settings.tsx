import { useState } from 'react';

interface SettingsSection {
  id: string;
  title: string;
  description: string;
}

const Settings = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [darkMode, setDarkMode] = useState(() => {
    // Check if user has already set a preference
    const savedPreference = localStorage.getItem('darkMode');
    return savedPreference === 'true';
  });
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  });

  const sections: SettingsSection[] = [
    {
      id: 'general',
      title: 'General Settings',
      description: 'Configure general application settings',
    },
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Customize the look and feel of the application',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Manage your notification preferences',
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Configure security settings and permissions',
    },
  ];

  const handleDarkModeToggle = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    localStorage.setItem('darkMode', String(newValue));
    
    // In a real application, you would apply the dark mode to the document
    // For this demo, we're just storing the preference
  };

  const handleNotificationChange = (type: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="md:flex">
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-gray-50 dark:bg-gray-900 p-4 border-r border-gray-200 dark:border-gray-700">
            <nav>
              <ul>
                {sections.map((section) => (
                  <li key={section.id} className="mb-1">
                    <button
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {section.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          
          {/* Content */}
          <div className="flex-1 p-6">
            {activeSection === 'general' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">General Settings</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Configure general application settings.</p>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Language</h3>
                    <select className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                      <option value="en">English</option>
                      <option value="fr">French</option>
                      <option value="es">Spanish</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Time Zone</h3>
                    <select className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                      <option value="utc">UTC</option>
                      <option value="est">Eastern Time (EST)</option>
                      <option value="cst">Central Time (CST)</option>
                      <option value="pst">Pacific Time (PST)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            {activeSection === 'appearance' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Appearance</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Customize the look and feel of the application.</p>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Dark Mode</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Enable dark mode for the application</p>
                    </div>
                    <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                      <input
                        type="checkbox"
                        id="darkModeToggle"
                        className="absolute w-6 h-6 opacity-0"
                        checked={darkMode}
                        onChange={handleDarkModeToggle}
                      />
                      <label
                        htmlFor="darkModeToggle"
                        className={`block w-full h-full overflow-hidden rounded-full cursor-pointer ${
                          darkMode ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`block w-6 h-6 rounded-full transform transition-transform duration-200 ease-in-out bg-white ${
                            darkMode ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Theme</h3>
                    <select className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                      <option value="default">Default</option>
                      <option value="blue">Blue</option>
                      <option value="green">Green</option>
                      <option value="purple">Purple</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            {activeSection === 'notifications' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Notifications</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Manage your notification preferences.</p>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
                    </div>
                    <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                      <input
                        type="checkbox"
                        id="emailToggle"
                        className="absolute w-6 h-6 opacity-0"
                        checked={notifications.email}
                        onChange={() => handleNotificationChange('email')}
                      />
                      <label
                        htmlFor="emailToggle"
                        className={`block w-full h-full overflow-hidden rounded-full cursor-pointer ${
                          notifications.email ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`block w-6 h-6 rounded-full transform transition-transform duration-200 ease-in-out bg-white ${
                            notifications.email ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Push Notifications</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive push notifications in browser</p>
                    </div>
                    <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                      <input
                        type="checkbox"
                        id="pushToggle"
                        className="absolute w-6 h-6 opacity-0"
                        checked={notifications.push}
                        onChange={() => handleNotificationChange('push')}
                      />
                      <label
                        htmlFor="pushToggle"
                        className={`block w-full h-full overflow-hidden rounded-full cursor-pointer ${
                          notifications.push ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`block w-6 h-6 rounded-full transform transition-transform duration-200 ease-in-out bg-white ${
                            notifications.push ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">SMS Notifications</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via SMS</p>
                    </div>
                    <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                      <input
                        type="checkbox"
                        id="smsToggle"
                        className="absolute w-6 h-6 opacity-0"
                        checked={notifications.sms}
                        onChange={() => handleNotificationChange('sms')}
                      />
                      <label
                        htmlFor="smsToggle"
                        className={`block w-full h-full overflow-hidden rounded-full cursor-pointer ${
                          notifications.sms ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`block w-6 h-6 rounded-full transform transition-transform duration-200 ease-in-out bg-white ${
                            notifications.sms ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeSection === 'security' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Security</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Configure security settings and permissions.</p>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Change Password</h3>
                    <form className="space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          id="currentPassword"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Update Password
                      </button>
                    </form>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Add an extra layer of security to your account by enabling two-factor authentication.
                    </p>
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;