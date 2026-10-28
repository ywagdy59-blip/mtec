import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock } from "lucide-react";
import StatCard from "../../components/admin/StatCard";
import LeadsTable from "../../components/admin/LeadsTable";
import { BarList, MonthColumns, statusBarColor } from "../../components/admin/Charts";
import { PageLoader } from "../../components/ui/Spinner";
import { getStats } from "../../services/dashboardService";
import { getLeads } from "../../services/leadService";
import { STATUSES } from "../../utils/constants";
import { getErrorMessage } from "../../utils/format";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([getStats(), getLeads({ limit: 5, sort: "newest" })])
      .then(([statsData, leadsData]) => {
        if (cancelled) return;
        setStats(statsData);
        setRecent(leadsData.leads);
      })
      .catch((e) => !cancelled && setError(getErrorMessage(e)));
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p className="form-error" role="alert">{error}</p>;
  if (!stats) return <PageLoader />;

  const cards = [
    { label: "Total Leads", value: stats.total, tone: "blue" },
    { label: "New Leads", value: stats.new, tone: "new" },
    { label: "Contacted Leads", value: stats.contacted, tone: "contacted" },
    { label: "Interested Leads", value: stats.interested, tone: "interested" },
    { label: "In Progress Leads", value: stats.inProgress, tone: "in-progress" },
    { label: "Won Leads", value: stats.won, tone: "won" },
    { label: "Lost Leads", value: stats.lost, tone: "lost" },
  ];

  return (
    <>
      <header className="admin-head">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">A quick look at your pipeline.</p>
        </div>
      </header>

      <section className="stat-grid" aria-label="Statistics">
        {cards.map((card, i) => (
          <StatCard key={card.label} index={i} {...card} />
        ))}
      </section>

      {stats.followUpsDue > 0 && (
        <Link to="/admin/leads" className="followup-banner">
          <CalendarClock size={22} />
          <span>
            <b>{stats.followUpsDue}</b> {stats.followUpsDue === 1 ? "lead is" : "leads are"} due for a follow-up today or earlier.
          </span>
        </Link>
      )}

      <section className="chart-grid">
        <div className="panel">
          <h2>Leads by status</h2>
          <BarList rows={STATUSES.map((s) => ({ label: s, count: stats.byStatus[s] }))} colorFor={statusBarColor} />
        </div>
        <div className="panel">
          <h2>Leads by service</h2>
          <BarList rows={stats.byService.map((s) => ({ label: s.service, count: s.count }))} />
        </div>
        <div className="panel panel-wide">
          <h2>Leads per month</h2>
          <MonthColumns rows={stats.byMonth} />
        </div>
      </section>

      <section>
        <div className="panel-head">
          <h2>Latest leads</h2>
          <Link to="/admin/leads" className="link-btn">View all leads</Link>
        </div>
        {recent.length ? (
          <LeadsTable leads={recent} compact />
        ) : (
          <div className="empty"><h3>No leads yet</h3><p>Requests from the website form will show up here.</p></div>
        )}
      </section>
    </>
  );
}
