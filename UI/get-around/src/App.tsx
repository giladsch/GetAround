import React, { FC, useCallback, useMemo, useState } from 'react';
import logo from './assets/logo.png';
import mapPhoto from './assets/map.jpeg';
import AsyncSelect from 'react-select/async';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import axios from 'axios';
import { MultiValue } from 'react-select';
import './App.css';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Backdrop, Box, createTheme, Fade, Modal, Typography } from '@mui/material';
import { ThemeProvider } from '@emotion/react';
import { DateRange, DateRangePicker, RangeKeyDict } from 'react-date-range';
import { addDays } from 'date-fns';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { style } from '@mui/system';
import { MyComponent } from './s';

interface Option {
	value: string;
	label: string;
}

const SERVER_URL = 'https://get-around-api-jzldcxdgrq-ew.a.run.app';

const _loadOptions = async (inputValue: string): Promise<Option[]> => {
	const options = (await axios.post<Option[]>(`${SERVER_URL}/api/places/search`, { value: inputValue })).data;

	return options;
};

const getPlan = async (places: MultiValue<Option>, numOfDays: number): Promise<any> => {
	const plenPerDay = (
		await axios.post<any>(`${SERVER_URL}/api/places/plan`, {
			places,
			numOfDays,
		})
	).data;

	return plenPerDay;
};

const theme = createTheme({
	palette: {
		primary: {
			main: '#B01AA7',
		},
		secondary: {
			main: '#FFC74F',
			contrastText: '#ffffff',
		},
	},
});

const loadOptions = AwesomeDebouncePromise(_loadOptions, 500);

export interface Point {
	name: string;
	lat: number;
	lng: number;
}

const App: FC = () => {
	const [places, setPlaces] = useState<MultiValue<Option>>([]);
	const [dateRangeOpen, setDateRangeOpen] = useState(false);
	const [dates, setDate] = useState<RangeKeyDict>({
		range1: { startDate: new Date(), endDate: addDays(new Date(), 1) },
	});
	const [mapOpen, setMapOpen] = useState(false);
	const [daysRoutes, setDaysRoutes] = useState<Point[][]>([]);

	const numOfDays = useMemo(
		() =>
			(dates?.range1?.endDate &&
				dates?.range1?.startDate &&
				(dates?.range1?.endDate.getTime() - dates?.range1?.startDate.getTime()) / (1000 * 60 * 60 * 24) + 1) ||
			0,
		[dates]
	);

	const getPlan = useCallback(async (places: MultiValue<Option>, numOfDays: number): Promise<any> => {
		const planPerDay = (
			await axios.post<Point[][]>(`${SERVER_URL}/api/places/plan`, {
				places,
				numOfDays,
			})
		).data;

		setDaysRoutes(planPerDay);
		setMapOpen(true);
	}, []);

	const checkInput: boolean = useMemo(() => places.length >= numOfDays, [places, numOfDays]);

	return (
		<div className='App'>
			<div className='App-header'>
				<img src={logo} className='App-logo' alt='logo' />
				<img src={mapPhoto} className='Map-logo' alt='logo' />
			</div>
			<div className='my-filler' />
			<div className='App-body'>
				<form>
					<ThemeProvider theme={theme}>
						<AsyncSelect
							isMulti
							cacheOptions
							noOptionsMessage={() => 'Loading...'}
							placeholder='Search For Attractions'
							loadOptions={loadOptions}
							className='places-select'
							onChange={setPlaces}
							value={places}
							theme={(theme) => ({
								...theme,
								colors: { ...theme.colors, primary: '#B01AA7' },
							})}
						/>
						<Button onClick={() => setDateRangeOpen(true)} color='secondary' variant='contained' className='date-picker-button'>
							Select Dates
						</Button>
						<Modal
							open={dateRangeOpen}
							onClose={() => setDateRangeOpen(false)}
							closeAfterTransition
							BackdropComponent={Backdrop}
							BackdropProps={{
								timeout: 500,
							}}
						>
							<Fade in={dateRangeOpen}>
								<div className='date-range-field-con'>
									<DateRange
										onChange={(newValue) => setDate((currValue) => ({ ...currValue, ...newValue }))}
										editableDateInputs={true}
										minDate={new Date()}
										ranges={[dates.range1]}
										className='date-range-field'
									/>
								</div>
							</Fade>
						</Modal>
						<div className='spacer' />
						<Button
							variant='contained'
							className='submit-button'
							disabled={!checkInput}
							onClick={() => getPlan(places, numOfDays)}
						>
							Press For Magic
						</Button>
						<Modal
							open={mapOpen}
							onClose={() => setMapOpen(false)}
							closeAfterTransition
							BackdropComponent={Backdrop}
							BackdropProps={{
								timeout: 500,
							}}
						>
							<Fade in={mapOpen}>
								<div className='date-range-field-con'>
									<MyComponent points={daysRoutes} />
								</div>
							</Fade>
						</Modal>
					</ThemeProvider>
				</form>
			</div>
			<div className='circle first-circle'></div>
			<div className='circle second-circle'></div>
		</div>
	);
};

export default App;
