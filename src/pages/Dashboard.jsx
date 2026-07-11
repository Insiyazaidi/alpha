import React, { useMemo } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from 'recharts'
import { useProducts } from '../contexts/ProductContext'
import StatsCard from '../components/ui/StatsCard'
import Spinner from '../components/ui/Spinner'

const CHART_COLORS = ['#7c6ff7', '#f472b6', '#60a5fa', '#4ade80', '#fbbf24', '#f87171', '#a78bfa', '#34d399']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: '8px 12px',
      fontSize: 13,
    }}>
      {label && <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || 'var(--text-primary)', fontWeight: 600 }}>
          {p.name}: {typeof p.value === 'number' ? (p.value % 1 === 0 ? p.value : p.value.toFixed(2)) : p.value}
        </p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { products, categories, loading, isPolling, lastUpdated } = useProducts()

  // useMemo: expensive analytics computations cached until products change
  const analytics = useMemo(() => {
    if (!products.length) return null

    const totalProducts = products.length
    const avgRating = products.reduce((s, p) => s + p.rating, 0) / totalProducts
    const totalInventoryValue = products.reduce((s, p) => s + p.price * p.stock, 0)
    const publishedCount = products.filter((p) => p.published).length

    // Category distribution
    const catMap = {}
    products.forEach((p) => {
      catMap[p.category] = (catMap[p.category] || 0) + 1
    })
    const categoryData = Object.entries(catMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    // Price distribution by bracket
    const brackets = [
      { name: '$0-25',    min: 0,   max: 25 },
      { name: '$25-50',   min: 25,  max: 50 },
      { name: '$50-100',  min: 50,  max: 100 },
      { name: '$100-250', min: 100, max: 250 },
      { name: '$250-500', min: 250, max: 500 },
      { name: '$500+',    min: 500, max: Infinity },
    ]
    const priceData = brackets.map(({ name, min, max }) => ({
      name,
      count: products.filter((p) => p.price >= min && p.price < max).length,
    }))

    // Rating distribution
    const ratingData = [1, 2, 3, 4, 5].map((r) => ({
      name: `${r}★`,
      count: products.filter((p) => p.rating >= r - 0.5 && p.rating < r + 0.5).length,
    }))

    // Top 5 most expensive
    const topByPrice = [...products].sort((a, b) => b.price - a.price).slice(0, 5)

    // Recent activity (simulated from product data)
    const activity = [...products]
      .slice(0, 8)
      .map((p, i) => ({
        id: p.id,
        text: `Product "${p.title.slice(0, 30)}..." updated`,
        time: `${i + 1}m ago`,
        color: CHART_COLORS[i % CHART_COLORS.length],
      }))

    return { totalProducts, avgRating, totalInventoryValue, publishedCount, categoryData, priceData, ratingData, topByPrice, activity }
  }, [products])

  if (loading) return <Spinner message="Loading analytics…" />

  if (!analytics) return (
    <div className="empty-state">
      <span className="empty-icon">📊</span>
      <p className="empty-title">No data available</p>
    </div>
  )

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="breadcrumb">
          <span>Home</span>
          <span className="breadcrumb-sep">›</span>
          <span>Analytics</span>
        </div>
        <h1 className="page-title">Analytics Dashboard</h1>
        <p className="page-subtitle">
          Product performance overview
          {lastUpdated && (
            <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-muted)' }}>
              · Updated {lastUpdated.toLocaleTimeString()}
              {isPolling && <span style={{ color: 'var(--color-primary)', marginLeft: 4 }}>⟳</span>}
            </span>
          )}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatsCard
          icon="📦"
          value={analytics.totalProducts.toLocaleString()}
          label="Total Products"
          trend={1}
          trendLabel="All categories"
          glowColor="#7c6ff7"
          iconBg="rgba(124,111,247,0.15)"
        />
        <StatsCard
          icon="⭐"
          value={analytics.avgRating.toFixed(2)}
          label="Average Rating"
          trend={1}
          trendLabel="Across all products"
          glowColor="#fbbf24"
          iconBg="rgba(251,191,36,0.12)"
        />
        <StatsCard
          icon="💰"
          value={`$${(analytics.totalInventoryValue / 1000).toFixed(0)}K`}
          label="Total Inventory Value"
          trend={1}
          trendLabel="Stock × Price"
          glowColor="#4ade80"
          iconBg="rgba(74,222,128,0.12)"
        />
        <StatsCard
          icon="🏷️"
          value={analytics.publishedCount}
          label="Published Products"
          trend={0}
          trendLabel={`${analytics.totalProducts - analytics.publishedCount} hidden`}
          glowColor="#f472b6"
          iconBg="rgba(244,114,182,0.12)"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="charts-grid">
        {/* Category Distribution Pie */}
        <div className="chart-card">
          <div className="chart-title">Category Distribution</div>
          <div className="chart-subtitle">Products per category</div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={analytics.categoryData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={50}
                dataKey="count"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {analytics.categoryData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Price Distribution Bar */}
        <div className="chart-card">
          <div className="chart-title">Price Distribution</div>
          <div className="chart-subtitle">Number of products by price range</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={analytics.priceData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Products" fill="url(#barGrad)" radius={[4, 4, 0, 0]}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c6ff7" />
                    <stop offset="100%" stopColor="#f472b6" />
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="charts-grid">
        {/* Rating Distribution Area */}
        <div className="chart-card">
          <div className="chart-title">Rating Distribution</div>
          <div className="chart-subtitle">Products by star rating</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={analytics.ratingData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#fbbf24" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                name="Products"
                stroke="#fbbf24"
                fill="url(#areaGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category table */}
        <div className="chart-card">
          <div className="chart-title">Top Categories</div>
          <div className="chart-subtitle">Products per category ranked</div>
          <table className="analytics-table">
            <tbody>
              {analytics.categoryData.slice(0, 8).map((cat, i) => {
                const pct = (cat.count / analytics.totalProducts) * 100
                return (
                  <tr key={cat.name}>
                    <td className="cat-name">{cat.name}</td>
                    <td className="cat-bar-wrap">
                      <div className="cat-bar-bg">
                        <div
                          className="cat-bar-fill"
                          style={{ width: `${pct}%`, background: CHART_COLORS[i % CHART_COLORS.length] }}
                        />
                      </div>
                    </td>
                    <td className="cat-count">{cat.count}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="chart-card">
        <div className="chart-title">Recent Activity</div>
        <div className="chart-subtitle">Latest product updates</div>
        <div className="activity-feed">
          {analytics.activity.map((item) => (
            <div key={item.id} className="activity-item">
              <div className="activity-dot" style={{ background: item.color }} />
              <div>
                <div className="activity-text">{item.text}</div>
                <div className="activity-time">{item.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
