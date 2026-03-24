import { GraduationCap, Lightbulb, Clock3, Radio } from "lucide-react";

const stats = [
  {
    id: 1,
    label: "Courses in progress",
    value: "3",
    icon: GraduationCap,
  },
  {
    id: 2,
    label: "Active Prototypes",
    value: "7",
    icon: Lightbulb,
  },
  {
    id: 3,
    label: "Hours Learning",
    value: "3h 15m",
    icon: Clock3,
  },
  {
    id: 4,
    label: "Community score",
    value: "240",
    icon: Radio,
  },
];

export default function OverviewStats() {
  return (
    <div className="overview-stats">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <article className="overview-stat-card" key={stat.id}>
            <div className="overview-stat-card__label-row">
              <span className="overview-stat-card__icon-wrap">
                <Icon size={12} />
              </span>
              <span className="overview-stat-card__label">{stat.label}</span>
            </div>

            <p className="overview-stat-card__value">{stat.value}</p>
          </article>
        );
      })}
    </div>
  );
}