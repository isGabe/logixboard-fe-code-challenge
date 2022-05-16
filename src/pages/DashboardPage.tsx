import { ReactElement, useState } from 'react';
import {
  Box,
  Button,
  Container,
  makeStyles,
  useTheme,
} from '@material-ui/core';
import { DataGrid, GridColDef } from '@material-ui/data-grid';
import Loader from 'react-loader-spinner';
import { differenceInWeeks, eachDayOfInterval, add, format } from 'date-fns';
import { FetchShipmentsResult, LoadingResult } from '../data/fetch-shipments';
import { Shipment } from '../data/Shipment';

type DashboardPageProps = {
  data: FetchShipmentsResult | LoadingResult;
};

const COLUMNS: GridColDef[] = [
  {
    field: 'houseBillNumber',
    headerName: 'House Bill',
    width: 150,
  },
  {
    field: 'client',
    headerName: 'Shipper',
    width: 200,
  },
  {
    field: 'origin',
    headerName: 'Origin',
    width: 400,
  },
  {
    field: 'destination',
    headerName: 'Destination',
    width: 400,
  },
  {
    field: 'estimatedDeparture',
    headerName: 'Estimated Departure',
    width: 200,
  },
  {
    field: 'mode',
    headerName: 'Mode',
    width: 200,
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 200,
  },
];

const useStyles = makeStyles({
  button: {
    marginRight: '2rem',
    '&:hover': {
      backgroundColor: '#63DCCB',
    },
  },
  container: {
    paddingBottom: '2rem',
  },
  weekday: {
    marginBottom: '2rem',
  },
  grid: {
    marginInline: 16,
    height: '100%',
    '& .MuiDataGrid-columnHeaderTitle': {
      fontWeight: 'bold',
      color: '#333',
    },
    '& .MuiDataGrid-footerContainer': {
      display: 'none',
    },
  },
  loader: {
    margin: 'auto',
    width: 'fit-content',
    marginTop: 200,
  },
});

export const DashboardPage: React.FC<DashboardPageProps> = ({ data }) => {
  const classes = useStyles();
  const theme = useTheme();
  const now = new Date();
  const [startDate, setStartDate] = useState(now);

  // Sort shipments by arrival date
  const sortedData =
    data.status === 'SUCCESS' &&
    [...data.shipments].sort((a: Shipment, b: Shipment) => {
      const aDate = new Date(a.estimatedArrival);
      const bDate = new Date(b.estimatedArrival);
      return aDate.getTime() - bDate.getTime();
    });

  // Group shipments by day
  const thisWeeksShipmentsByDay = () => {
    // Get an array of days for the next `weeks` weeks
    const weekDays = eachDayOfInterval({
      start: startDate,
      end: add(startDate, { days: 6 }),
    });

    // Get shipments for the next `weeks` weeks
    const shipments =
      sortedData &&
      sortedData.reduce((accumulator, shipment: Shipment) => {
        const date = new Date(shipment.estimatedArrival);

        const weekDifference = differenceInWeeks(date, startDate);
        if (weekDifference === 0) {
          accumulator.push(shipment);
        }

        return accumulator;
      }, [] as Shipment[]);

    // Group shipments by day
    const shipmentsByDay = weekDays.map((day: Date) => {
      const dayShipments =
        shipments &&
        shipments.filter((shipment: Shipment) => {
          return (
            new Date(shipment.estimatedArrival).getTime() === day.getTime()
          );
        });

      return {
        day: format(day, 'EEEE MMMM d, yyyy'),
        shipments: dayShipments,
      };
    });

    return shipmentsByDay;
  };

  let component: ReactElement;
  switch (data.status) {
    case 'SUCCESS':
      component = (
        <Container className={classes.container}>
          <h1>
            Shipments for week of {format(startDate, 'EEEE MMMM d, yyyy')}
          </h1>
          <Button
            className={classes.button}
            variant="contained"
            color="primary"
            onClick={() => setStartDate(add(startDate, { days: -7 }))}
          >
            Show previous week's shipments
          </Button>
          <Button
            className={classes.button}
            variant="contained"
            color="primary"
            onClick={() => setStartDate(add(startDate, { days: 7 }))}
          >
            Show next week's shipments
          </Button>

          {thisWeeksShipmentsByDay &&
            thisWeeksShipmentsByDay().map(
              (day: { day: string; shipments: false | Shipment[] }) => {
                return (
                  <Box key={day.day} className={classes.weekday}>
                    <h2>{day.day}</h2>
                    {day.shipments && day.shipments.length ? (
                      <DataGrid
                        className={classes.grid}
                        rows={day.shipments}
                        columns={COLUMNS}
                        disableSelectionOnClick
                        autoHeight
                        autoPageSize
                      />
                    ) : (
                      <p
                        style={{
                          marginLeft: '1rem',
                          fontStyle: 'italic',
                          fontWeight: 'bold',
                        }}
                      >
                        No shipments
                      </p>
                    )}
                  </Box>
                );
              }
            )}
        </Container>
      );
      break;
    case 'LOADING':
      component = (
        <Box className={classes.loader}>
          <Loader type="Grid" color={theme.palette.primary.main} />
        </Box>
      );
      break;
    case 'ERROR':
      component = <p>Error</p>;
      break;
  }
  return component;
};
