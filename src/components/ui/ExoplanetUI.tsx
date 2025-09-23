import React, { useState } from "react";

interface Inputs {
  koi_period: number | "";
  koi_prad: number | "";
  koi_teq: number | "";
  koi_insol: number | "";
  koi_depth: number | "";
  koi_duration: number | "";
}

interface Props {
  predictExoplanet: (inputs: Inputs) => Promise<string>;
  onPredicted?: (entry: { inputs: Record<string, number | string>; prediction: string; timestamp: number }) => void;
}

const ExoplanetUI: React.FC<Props> = ({ predictExoplanet, onPredicted }) => {
  const [inputs, setInputs] = useState<Inputs>({
    koi_period: "",
    koi_prad: "",
    koi_teq: "",
    koi_insol: "",
    koi_depth: "",
    koi_duration: ""
  });

  const [prediction, setPrediction] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: value === "" ? "" : parseFloat(value) });
  };

  const handlePredict = async () => {
    const result = await predictExoplanet(inputs);
    setPrediction(result);
    if (onPredicted) {
      onPredicted({
        // Cast via unknown to satisfy TS while keeping Inputs strict
        inputs: (inputs as unknown) as Record<string, number | string>,
        prediction: result,
        timestamp: Date.now(),
      });
    }
  };

  return (
    <div>
      <h2>Exoplanet Predictor</h2>
      {Object.keys(inputs).map((key) => (
        <div key={key}>
          <label>{key}:</label>
          <input
            name={key}
            type="number"
            value={inputs[key as keyof Inputs]}
            onChange={handleChange}
          />
        </div>
      ))}
      <button onClick={handlePredict}>Predict</button>
      <p>Prediction: {prediction}</p>
    </div>
  );
};

export default ExoplanetUI;