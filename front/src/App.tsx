import React, { useState, useEffect } from 'react';
import {
  Card,
  CardActions,
  CardContent,
  Divider,
  FormControl,
  FormLabel,
  Input,
  List,
  ListItem,
  Typography,
  Select,
  SelectChangeEvent,
  Button,
  Alert,
} from '@mui/material';
import './index.css';

function App() {
  interface OldImcRecord {
    weight: number;
    height: number;
    bmi: number;
  }
  
  const [display, setDisplay] = useState<number | null>(null);
  const [kg, setKg] = useState<number | "">(0);
  const [heightValue, setHeightValue] = useState<number | "">(0);
  const [heightUnit, setHeightUnit] = useState<string>('cm');
  const [weightUnit, setWeightUnit] = useState<string>('kg');
  const [errors, setErrors] = useState<string[]>([]);
  const [oldImc, setOldImc] = useState<any[]>([]);

  const fetchOldImc = async () => {
    try {
      const response = await fetch("https://bmi.plotconform.xyz/api/");
      if (!response.ok) {
        throw new Error("Error fetching old IMC data.");
      }
      const data: OldImcRecord[] = await response.json();
      const sortedData = data.sort((a, b) => b.bmi - a.bmi);
      setOldImc(sortedData);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchOldImc();
  }, []);

  const handleKgInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseFloat(event.target.value);
    value = Math.max(value, 0);
    value = Math.round(value * 2) / 2;
    setKg(isNaN(value) ? "" : value);
  };

  const handleHeightInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseFloat(event.target.value);
    value = Math.max(value, 0);
    value = Math.round(value * 2) / 2;
    setHeightValue(isNaN(value) ? "" : value);
  };

  const handleHeightUnitChange = (event: SelectChangeEvent<string>) => {
    setHeightUnit(event.target.value);
  };

  const handleWeightUnitChange = (event: SelectChangeEvent<string>) => {
    setWeightUnit(event.target.value);
  };

  const convertHeightToCm = (value: number, unit: string) => {
    switch (unit) {
      case 'm':
        return value * 100;
      case 'ft':
        return value * 30.48;
      default:
        return value;
    }
  };

  const convertWeightToKg = (value: number, unit: string) => {
    switch (unit) {
      case 'lbs':
        return value * 0.453592;
      default:
        return value;
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (kg === "" || heightValue === "") {
      setErrors(["Please enter valid values for weight and height."]);
      return;
    }

    const heightInCm = convertHeightToCm(heightValue, heightUnit);
    const weightInKg = convertWeightToKg(kg, weightUnit);

    const newTodo = {
      kg: weightInKg,
      height: heightInCm,
      created_at: new Date().toISOString(), 
    };

    fetch("https://bmi.plotconform.xyz/api/imc/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTodo),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error fetching data.");
        }
        return response.json();
      })
      .then((data) => {
        setDisplay(parseInt(data));
        setErrors([]);
        fetchOldImc();
      })
      .catch((error) => {
        console.error("Error:", error);
        setErrors(["An error occurred while fetching data."]);
      });
  };

  return (
    <>
      <div className="container">
        <Card variant="outlined" className="card">
          <Typography style={{ fontWeight: 'bold', padding: '0.5em', marginBottom: '0px' }} variant="h5" gutterBottom>
            Calculate your BMI
          </Typography>
          <Divider />
          <form onSubmit={handleSubmit}>
            <CardContent>
              {errors.map((error, index) => (
                <Alert key={index} severity="warning" onClose={() => setErrors(errors.filter((_, i) => i !== index))}>
                  {error}
                </Alert>
              ))}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <FormControl>
                  <FormLabel>Your weight</FormLabel>
                  <div style={{ display: 'flex', alignItems: 'center', height: '40px' }}>
                    <Input
                      type="number"
                      style={{ fontSize: '1.25em', width: '80%', height: '100%' }}
                      placeholder={`Enter weight`}
                      value={kg === "" ? "" : kg.toString()}
                      onChange={handleKgInput}
                    />
                    <Select
                      value={weightUnit}
                      onChange={handleWeightUnitChange}
                      native
                      input={<Input style={{ fontSize: '1.25em' }} />}
                      style={{width: '20%', height: '100%'}}
                    >
                      <option value="kg">kg</option>
                      <option value="lbs">lbs</option>
                    </Select>
                  </div>
                </FormControl>
                <FormControl>
                  <FormLabel>Your height</FormLabel>
                  <div style={{ display: 'flex', alignItems: 'center', height: '40px' }}>
                    <Input
                      type="number"
                      placeholder={`Enter height`}
                      style={{ fontSize: '1.25em', width: '80%', height: '100%' }}
                      value={heightValue === "" ? "" : heightValue.toString()}
                      onChange={handleHeightInput}
                    />
                    <Select
                      value={heightUnit}
                      onChange={handleHeightUnitChange}
                      native
                      input={<Input style={{ fontSize: '1.25em' }} />}
                      style={{width: '20%', height: '100%'}}
                    >
                      <option value="cm">cm</option>
                      <option value="m">m</option>
                      <option value="ft">ft</option>
                    </Select>
                  </div>
                </FormControl>
              </div>
              <CardActions style={{ padding: '0', paddingTop: '1.5em', width: '100%', height: '35px' }}>
                <div style={{ width: '100%', height: '50px', display: 'flex', justifyContent: 'space-between' }}>
                  <Button type="submit" variant="contained" disabled={kg === "" || heightValue === ""}>
                    <Typography variant="h6" style={{ fontSize: '1.5em', marginBottom: '0' }} gutterBottom>
                      Submit
                    </Typography>
                  </Button>
                  {display !== null && !isNaN(display) && (
                    <Button disableRipple variant="outlined" style={{ maxHeight: '100%', height: '100px', display: 'flex', alignItems: 'center', padding: '0 0.5em', fontSize: '1em', fontWeight: 'bold'}}>
                        Your BMI is: {display}
                    </Button>
                  )}
                  {(display !== null && isNaN(display)) && (
                    <Alert severity="warning" style={{ height: '100%', padding: '0.5em', marginBottom: '0', fontSize: '1.25em', display: 'flex', alignItems: 'center' }}>
                      Invalid BMI value.
                    </Alert>
                  )}
                </div>
              </CardActions>
            </CardContent>
          </form>
        </Card>
        <Card variant="outlined" className="card">
          <List>
            <ListItem>
              <Typography style={{ fontWeight: 'bold', fontSize: '0.5em' }} variant="h4" gutterBottom>
                BMI Classification:
              </Typography>
            </ListItem>
            <ListItem>
              <Typography style={{ fontWeight: display && display < 18.5 ? 'bold' : '', fontSize: display && display < 18.5 ? '0.25' : '' }} variant="h6" gutterBottom>
                Less than 18.5: Underweight
              </Typography>
            </ListItem>
            <ListItem>
              <Typography style={{ fontWeight: display && display >= 18.5 && display <= 25 ? 'bold' : '', fontSize: display && display >= 18.5 && display <= 25 ? '0.25' : '' }} variant="h6" gutterBottom>
                Between 18.5 and 25: normal weight
              </Typography>
            </ListItem>
            <ListItem>
              <Typography style={{ fontWeight: display && display > 25 && display <= 30 ? 'bold' : '', fontSize: display && display > 25 && display <= 30 ? '0.25' : '' }} variant="h6" gutterBottom>
                Between 25 and 30: Overweight
              </Typography>
            </ListItem>
            <ListItem>
              <Typography style={{ fontWeight: display && display > 30 && display <= 40 ? 'bold' : '', fontSize: display && display > 30 && display <= 40 ? '0.25' : '' }} variant="h6" gutterBottom>
                Between 30 and 40: Moderately obese
              </Typography>
            </ListItem>
            <ListItem>
              <Typography style={{ fontWeight: display && display > 40 ? 'bold' : '', fontSize: display && display > 40 ? '0.25' : '' }} variant="h6" gutterBottom>
                Greater than 40: Severely obese
              </Typography>
            </ListItem>
          </List>
        </Card>
      </div>
      <Card variant="outlined" className="card-old-imc" style={{ width: '100%', border: '0px' }}>
        <List className='old-imc'>
          <Typography variant="h6" gutterBottom>
            Old BMI
          </Typography>
          <div style={{ height: '300px', overflow: 'auto' }}>
            {oldImc.map((item, index) => (
              <ListItem key={index}>
                <Typography variant="body1" gutterBottom>
                  BMI: {item[3]} - Weight: {item[1]} kg - Height: {item[2]} cm - Created At: {item[4]}
                </Typography>
              </ListItem>
            )).reverse()}
          </div>
        </List>
      </Card>
    </>
  );
}

export default App;
