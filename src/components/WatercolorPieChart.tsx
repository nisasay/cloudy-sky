import React from 'react';
import { CloudCategory } from '../types';
import { useApp } from '../context/AppContext';

interface WatercolorPieChartProps {
  categories: CloudCategory[];
  fixedIncome: number;
  currencySymbol: string;
}

export const WatercolorPieChart: React.FC<WatercolorPieChartProps> = ({
  categories,
  fixedIncome,
  currencySymbol,
}) => {
  const { t, getCatName } = useApp();

  const totalAllocated = categories.reduce((sum, c) => sum + (c.budgetLimit || 0), 0);
  const pieTotal = Math.max(fixedIncome, totalAllocated);
  const savings = Math.max(0, fixedIncome - totalAllocated);

  if (pieTotal <= 0) {
    return (
      <div className="h-40 flex items-center justify-center text-indigo-300 text-xs italic font-serif bg-indigo-50/50 rounded-2xl border border-indigo-100">
        {t('config_income')}
      </div>
    );
  }

  // Morandi soft gray/lavender/purple color palette for category slices
  const morandiColors = [
    '#a5b4fc', // Morandi soft indigo
    '#c084fc', // Morandi soft violet
    '#94a3b8', // Morandi slate gray
    '#cbd5e1', // Morandi light gray
    '#d8b4fe', // Morandi soft lilac
    '#818cf8', // Morandi purple
    '#e9d5ff', // Morandi soft mauve
    '#93c5fd', // Morandi misty blue
  ];

  // Build items array (categories + savings)
  const items = [
    ...categories.map((cat) => ({
      id: cat.id,
      name: getCatName(cat.name),
      amount: cat.budgetLimit || 0,
      isSavings: false,
    })),
    ...(savings > 0
      ? [
          {
            id: 'savings-slice',
            name: `${t('nav_savings') || 'Savings'} ✨`,
            amount: savings,
            isSavings: true,
          },
        ]
      : []),
  ].filter((item) => item.amount > 0);

  // Generate pie slices
  let cumulativeAngle = 0;
  let colorIndex = 0;

  const slices = items.map((item) => {
    const fraction = item.amount / pieTotal;
    const angle = fraction * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle = endAngle;

    const x1 = Math.cos((Math.PI * (startAngle - 90)) / 180) * 80 + 100;
    const y1 = Math.sin((Math.PI * (startAngle - 90)) / 180) * 80 + 100;
    const x2 = Math.cos((Math.PI * (endAngle - 90)) / 180) * 80 + 100;
    const y2 = Math.sin((Math.PI * (endAngle - 90)) / 180) * 80 + 100;

    const largeArcFlag = angle > 180 ? 1 : 0;
    const pathData =
      angle >= 359.99
        ? `M 100 20 A 80 80 0 1 1 99.9 20 Z`
        : `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    const sliceColor = item.isSavings
      ? '#fde047'
      : morandiColors[colorIndex++ % morandiColors.length];

    return {
      item,
      color: sliceColor,
      pathData,
      fraction,
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100/80 backdrop-blur-md">
      <div className="relative w-40 h-40 flex-shrink-0">
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
          <defs>
            <filter id="pie-soft-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="yellow-glowing-light" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComponentTransfer in="blur" result="glow">
                <feFuncA type="linear" slope="0.8" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g filter="url(#pie-soft-glow)">
            {slices.map((s, i) => (
              <path
                key={s.item.id || i}
                d={s.pathData}
                fill={s.color}
                opacity={s.item.isSavings ? '0.95' : '0.88'}
                filter={s.item.isSavings ? 'url(#yellow-glowing-light)' : undefined}
                className="transition-all duration-300 hover:opacity-100 hover:scale-[1.02] transform origin-center cursor-pointer"
              />
            ))}
          </g>
          {/* Inner cutout for donut effect */}
          <circle cx="100" cy="100" r="48" className="fill-white" />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
            {t('config_income')}
          </span>
          <span className="text-sm font-serif italic font-extrabold text-indigo-950">
            {currencySymbol}
            {pieTotal.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs w-full sm:w-auto">
        {slices.map((s) => (
          <div key={s.item.id} className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm ${
                s.item.isSavings ? 'animate-pulse ring-2 ring-amber-300' : ''
              }`}
              style={{ backgroundColor: s.color }}
            />
            <span
              className={`truncate max-w-[100px] font-medium ${
                s.item.isSavings ? 'text-amber-800 font-bold' : 'text-indigo-900'
              }`}
            >
              {s.item.name}
            </span>
            <span
              className={`font-mono text-[11px] ml-auto ${
                s.item.isSavings ? 'text-amber-600 font-bold' : 'text-indigo-500'
              }`}
            >
              {(s.fraction * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

