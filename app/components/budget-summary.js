"use client";

import React, { useEffect, useState } from "react";
import { getFirestore, collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { app } from "../_utils/firebase";

const BudgetSummary = ({ user }) => {
  const [data, setData] = useState([]);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const db = getFirestore(app);

    // Listen for real-time updates in the budget records
    const recordsRef = collection(db, "budgetRecords");
    const q = query(recordsRef, where("userId", "==", user.uid));

    const unsubscribeRecords = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(fetchedData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching budget records:", err);
        setError("Failed to load budget records.");
        setLoading(false);
      }
    );

    // Fetch the user's budget
    const userDocRef = doc(db, "users", user.uid);
    getDoc(userDocRef)
      .then((docSnapshot) => {
        if (docSnapshot.exists()) {
          setBudget(docSnapshot.data().budget);
        } else {
          setBudget(null);
        }
      })
      .catch((err) => {
        console.error("Error fetching user budget:", err);
        setError("Failed to load user budget.");
      });

    return () => unsubscribeRecords();
  }, [user]);

  const totalReceived = data
    .filter((item) => item.amount > 0)
    .reduce((acc, item) => acc + item.amount, 0);

  const totalSpent = data
    .filter((item) => item.amount < 0)
    .reduce((acc, item) => acc + item.amount, 0);

  const netBalance = totalReceived + totalSpent;

  if (loading) {
    return (
      <div className="bg-[#f5eed5] p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-4 text-gray-800 text-center">Budget Summary</h2>
        <p className="text-center">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#f5eed5] p-6 rounded-lg shadow-lg">
        <h2 className="text-5xl font-bold mb-4 text-gray-800 text-center">Budget Summary</h2>
        <p className="text-center text-red-500">{error}</p>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="bg-[#f5eed5] p-6 rounded-lg shadow-lg">
        <h2 className="text-5xl font-bold mb-4 text-gray-800 text-center">Budget Summary</h2>
        <p className="text-center">No records available. Please add some budget records.</p>
      </div>
    );
  }

  const budgetComparison =
  budget !== null
    ? netBalance < 0 && Math.abs(netBalance) > budget
      ? `You have exceeded your budget by $${(Math.abs(netBalance) - budget).toFixed(2)}.`
      : `You are within your budget by $${(budget - Math.abs(netBalance)).toFixed(2)}.`
    : "No budget set.";


  return (
    <div className="bg-[#f5eed5] p-6 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-4 text-gray-800 text-center">Budget Summary</h2>
      <div className="bg-white p-4 rounded-md shadow">
        <p className="text-2xl font-semibold text-gray-800">
          Total Received:
          <span className="text-green-500 font-bold ml-2">
            ${totalReceived.toFixed(2)}
          </span>
        </p>
        <p className="text-2xl font-semibold text-gray-800">
          Total Spent:
          <span className="text-red-500 font-bold ml-2">
            ${Math.abs(totalSpent).toFixed(2)}
          </span>
        </p>
        <hr className="my-4 border-gray-300" />
        <p className="text-2xl font-semibold text-gray-800">
          Net Balance:
          <span
            className={`font-bold ml-2 ${
              netBalance >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            ${netBalance.toFixed(2)}
          </span>
        </p>
        <p className="text-lg text-gray-700 mt-4">{budgetComparison}</p>
      </div>
    </div>
  );
};

export default BudgetSummary;
