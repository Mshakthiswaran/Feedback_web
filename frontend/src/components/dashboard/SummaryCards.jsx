export default function SummaryCards({ stats }) {
    // stats expected: { totalSubmissions, responseRate, averageRating, activeForms }

    const cards = [
        { title: 'Total Submissions', value: stats?.totalSubmissions || 0, color: 'border-l-blue-500' },
        { title: 'Response Rate', value: `${stats?.responseRate || 0}%`, color: 'border-l-indigo-500' },
        { title: 'Average Rating', value: `${stats?.averageRating || 0} / 5`, color: 'border-l-green-500' },
        { title: 'Active Forms', value: stats?.activeForms || 0, color: 'border-l-purple-500' }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {cards.map((card, idx) => (
                <div
                    key={idx}
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 border-l-4 ${card.color}`}
                >
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        {card.title}
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {card.value}
                    </h3>
                </div>
            ))}
        </div>
    );
}