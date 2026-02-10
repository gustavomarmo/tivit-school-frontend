import styles from './Table.module.css';

export function Table({ headers, children }) {
    return (
        <div className={styles.container}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        {headers.map((h, index) => (
                            <th key={index}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {children}
                </tbody>
            </table>
        </div>
    );
}