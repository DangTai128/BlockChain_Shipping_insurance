import React, { useState } from 'react';
import Header from './components/Header';
import CreatePolicyForm from './components/CreatePolicyForm';
import PolicyList from './components/PolicyList';
import ContractDebug from './components/ContractDebug';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('create');

  const handlePolicyCreated = () => {
    setActiveTab('list');
  };

  return (
    <div className="App">
      <Header />
      
      <main className="main-content">
        <div className="container">
          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              📝 Tạo hợp đồng bảo hiểm
            </button>
            <button 
              className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => setActiveTab('list')}
            >
              📋 Danh sách hợp đồng
            </button>
            <button 
              className={`tab-button ${activeTab === 'debug' ? 'active' : ''}`}
              onClick={() => setActiveTab('debug')}
            >
              🔧 Debug
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'create' && (
              <CreatePolicyForm onPolicyCreated={handlePolicyCreated} />
            )}
            {activeTab === 'list' && (
              <PolicyList />
            )}
            {activeTab === 'debug' && (
              <ContractDebug />
            )}
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 Bảo hiểm Vận chuyển Blockchain - Dự án sinh viên đại học</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
