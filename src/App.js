import { useState, useEffect } from "react";

// `https://api.frankfurter.app/latest?amount=100&from=EUR&to=USD`

export default function App() {
  const [amount, setAmount] = useState(1);
  const [fromCur, setFromCur] = useState("EUR");
  const [toCur, setToCur] = useState("USD");
  const [converted, setConverted] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedAmount, setDebouncedAmount] = useState(amount);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAmount(amount);
    }, 500);
    // 500ms delay

    return () => clearTimeout(timer);
  }, [amount]);

  useEffect(() => {
    const controller = new AbortController();

    async function convert() {
      try {
        setIsLoading(true);

        if (!debouncedAmount || debouncedAmount <= 0) {
          setConverted("");
          setError("Invalid Amount");
          return;
        }

        const res = await fetch(
          `https://api.frankfurter.dev/v1/latest?from=${fromCur}&to=${toCur}&amount=${debouncedAmount}`,
          {
            signal: controller.signal,
          },
        );

        // if (!res.okay) throw new Error("Failed to fetch");

        const data = await res.json();
        setConverted(data.rates[toCur]);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Conversion Failed");
          setConverted("");
        }
      } finally {
        setIsLoading(false);
      }
    }

    if (fromCur === toCur) {
      setConverted(debouncedAmount);
      return;
    }

    convert();

    return () => {
      controller.abort(); //cancel previous requeste
    };
  }, [debouncedAmount, fromCur, toCur]);

  return (
    <div className="main">
      <h1>Currency Converter</h1>
      <input
        value={amount}
        type="text"
        placeholder="Enter Amount to convert"
        onChange={(e) => {
          const value = Number(e.target.value);
          setAmount(isNaN(value) ? "" : value);
          setError("");
        }}
        // disabled={isLoading}
      />
      <select value={fromCur} onChange={(e) => setFromCur(e.target.value)}>
        <option value="USD">USD - $</option>
        <option value="EUR">EUR - €</option>
        <option value="CAD">CAD - $</option>
        <option value="INR">INR - ₨</option>
      </select>
      <select value={toCur} onChange={(e) => setToCur(e.target.value)}>
        <option value="USD">USD - $</option>
        <option value="EUR">EUR - €</option>
        <option value="CAD">CAD - $</option>
        <option value="INR">INR - ₨</option>
      </select>
      <p>
        Output :
        <span style={{ fontWeight: 600 }}>
          {" "}
          {isLoading ? (
            "Converting..."
          ) : error ? (
            <span style={{ color: "red" }}> {error}</span>
          ) : (
            converted
          )}{" "}
        </span>{" "}
        {toCur}
      </p>
    </div>
  );
}
