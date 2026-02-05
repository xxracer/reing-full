const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { pool } = require('./backend/db');

const scheduleData = [
    {
        day: 'Monday',
        sessions: [
            { time: '10:00 AM - 11:00 AM', title: 'Homeschool Kids', tags: ['kids'] },
            { time: '11:00 AM - 12:00 PM', title: 'Adults Jiu Jitsu (all levels)', tags: ['adults'] },
            { time: '4:00 PM - 5:00 PM', title: 'Private Lessons', tags: ['private'] },
            { time: '5:00 PM - 5:55 PM', title: 'Kids (7-9 yrs)', tags: ['kids'] },
            { time: '5:00 PM - 6:00 PM', title: 'Wrestling Program', tags: ['wrestling'] },
            { time: '6:00 PM - 6:55 PM', title: 'Kids (10-13 yrs)', tags: ['kids'] },
            { time: '7:00 PM - 8:00 PM', title: 'Adults Gi (all levels)', tags: ['adults'] }
        ]
    },
    {
        day: 'Tuesday',
        sessions: [
            { time: '4:00 PM - 5:00 PM', title: 'Private Lessons', tags: ['private'] },
            { time: '5:00 PM - 5:45 PM', title: 'Kids (4-6 yrs)', tags: ['kids'] },
            { time: '6:00 PM - 6:55 PM', title: 'Kids Comp Class', tags: ['kids'] },
            { time: '7:00 PM - 8:00 PM', title: 'Adults Gi (advanced)', tags: ['adults'] },
            { time: '7:00 PM - 8:00 PM', title: 'Adult Fundamentals', tags: ['adults'] }
        ]
    },
    {
        day: 'Wednesday',
        sessions: [
            { time: '10:00 AM - 11:00 AM', title: 'Homeschool Kids', tags: ['kids'] },
            { time: '11:00 AM - 12:00 PM', title: 'Adult Jiu Jitsu (all levels)', tags: ['adults'] },
            { time: '4:00 PM - 5:00 PM', title: 'Private Lessons', tags: ['private'] },
            { time: '5:00 PM - 5:55 PM', title: 'Kids (7-9 yrs)', tags: ['kids'] },
            { time: '5:00 PM - 6:00 PM', title: 'Wrestling Program', tags: ['wrestling'] },
            { time: '6:00 PM - 6:55 PM', title: 'Kids (10-13 yrs)', tags: ['kids'] },
            { time: '7:00 PM - 8:00 PM', title: 'Adults Gi (all levels)', tags: ['adults'] }
        ]
    },
    {
        day: 'Thursday',
        sessions: [
            { time: '4:00 PM - 5:00 PM', title: 'Private Lessons', tags: ['private'] },
            { time: '5:00 PM - 5:45 PM', title: 'Kids (4-6 yrs)', tags: ['kids'] },
            { time: '5:00 PM - 6:00 PM', title: 'Wrestling Program', tags: ['wrestling'] },
            { time: '6:00 PM - 6:55 PM', title: 'Kids Comp Class', tags: ['kids'] },
            { time: '7:00 PM - 8:00 PM', title: 'Adult Gi (Advanced)', tags: ['adults'] }
        ]
    },
    {
        day: 'Friday',
        sessions: [
            { time: '10:00 AM - 11:00 AM', title: 'Homeschool Kids', tags: ['kids'] },
            { time: '11:00 AM - 12:00 PM', title: 'Adult Jiu Jitsu (all levels)', tags: ['adults'] },
            { time: '4:00 PM - 5:00 PM', title: 'Private Lessons', tags: ['private'] },
            { time: '5:00 PM - 5:55 PM', title: 'Kids (7-9 yrs)', tags: ['kids'] },
            { time: '6:00 PM - 6:55 PM', title: 'Kids (10-13 yrs)', tags: ['kids'] },
            { time: '7:00 PM - 8:00 PM', title: 'Kids Comp Class (all levels)', tags: ['kids'] },
            { time: '7:00 PM - 8:00 PM', title: 'Adult Jiu Jitsu (all levels)', tags: ['adults'] }
        ]
    },
    {
        day: 'Saturday',
        sessions: [
            { time: '11:00 AM - 12:00 PM', title: 'Adults Gi (all levels)', tags: ['adults'] },
            { time: '11:00 AM - 12:00 PM', title: 'Adult Fundamentals', tags: ['adults'] },
            { time: '12:00 PM - 4:00 PM', title: 'Private Lessons', tags: ['private'] }
        ]
    },
    {
        day: 'Sunday',
        sessions: []
    }
];

const seed = async () => {
    try {
        const { rows } = await pool.query('SELECT COUNT(*) FROM schedules');
        if (parseInt(rows[0].count) > 0) {
            console.log('Schedule table already has data. Skipping seed.');
            process.exit(0);
        }

        console.log('Seeding schedules...');
        for (const dayData of scheduleData) {
            for (const session of dayData.sessions) {
                await pool.query(
                    'INSERT INTO schedules (day, time_range, class_name, category) VALUES ($1, $2, $3, $4)',
                    [dayData.day, session.time, session.title, session.tags[0]]
                );
            }
        }
        console.log('Done seeding!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding:', err);
        process.exit(1);
    }
};

seed();
