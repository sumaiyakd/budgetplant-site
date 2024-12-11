// records-list-all.js
import React, { useEffect, useState } from "react";
import { db, collection, query, onSnapshot } from "../_utils/firebase";

const RecordsListAll = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "budgetRecords"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setData(records);
    });

    return () => unsubscribe();
  }, []);

  const formatDate = (isoDate) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(isoDate).toLocaleDateString(undefined, options);
  };

  return (
    <ul className="space-y-2">
      {data.map((item) => (
        <li
          key={item.id}
          className="border border-gray-300 rounded-lg p-2 bg-gray-100 shadow hover:bg-gray-200"
        >
          <p className="text-xs text-gray-700 italic">{formatDate(item.date)}</p>
          <p className="text-sm font-semibold text-gray-800">{item.category}</p>
          <p className="text-xs text-gray-600">{item.description}</p>
          <p
            className={`text-sm font-bold ${
              item.amount > 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {item.amount > 0
              ? `+$${item.amount.toFixed(2)}`
              : `-$${Math.abs(item.amount).toFixed(2)}`}
          </p>
        </li>
      ))}
    </ul>
  );
};

export default RecordsListAll;