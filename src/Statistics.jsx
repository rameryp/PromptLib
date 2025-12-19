import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

function Statistics({ prompts }) {
    // Calculate Stats
    const totalPrompts = prompts.length;
    const validatedPrompts = prompts.filter(p => p.status === 'Validated').length;
    const draftPrompts = prompts.filter(p => p.status === 'Draft').length;

    // Group by LLM
    const llmCounts = prompts.reduce((acc, prompt) => {
        acc[prompt.llm] = (acc[prompt.llm] || 0) + 1;
        return acc;
    }, {});

    const llmData = Object.keys(llmCounts).map(key => ({
        name: key,
        count: llmCounts[key]
    }));

    // Group by Category
    const categoryCounts = prompts.reduce((acc, prompt) => {
        acc[prompt.category] = (acc[prompt.category] || 0) + 1;
        return acc;
    }, {});

    const categoryData = Object.keys(categoryCounts).map(key => ({
        name: key,
        value: categoryCounts[key]
    }));

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

    // Custom Chart Style
    const chartStyle = {
        backgroundColor: 'var(--bg-card)',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid var(--border-color)',
        marginBottom: '2rem'
    };

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            <h1 className="page-title" style={{ marginBottom: '2rem' }}>Library Statistics</h1>

            {/* Summary Cards */}
            <div className="stats-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <div style={chartStyle}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total Prompts</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{totalPrompts}</div>
                </div>
                <div style={chartStyle}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Validated</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10B981' }}>{validatedPrompts}</div>
                </div>
                <div style={chartStyle}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Drafts</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#F59E0B' }}>{draftPrompts}</div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="charts-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '1.5rem'
            }}>

                {/* LLM Distribution */}
                <div style={chartStyle}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Prompts by Model</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={llmData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tick={{ fill: 'var(--text-secondary)' }} />
                                <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Distribution */}
                <div style={chartStyle}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Prompts by Category</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Statistics;
