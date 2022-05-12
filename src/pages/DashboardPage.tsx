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
  const [weeksToShow, setWeeksToShow] = useState(1);

  const now = new Date();
  // Sort shipments by arrival date
  const sortedData =
    data.status === 'SUCCESS' &&
    [...data.shipments]
      .sort((a: Shipment, b: Shipment) => {
        const aDate = new Date(a.estimatedArrival);
        const bDate = new Date(b.estimatedArrival);
        return aDate.getTime() - bDate.getTime();
      })
      // Return only shipments arriving in the future
      .filter((shipment: Shipment) => {
        const date = new Date(shipment.estimatedArrival);
        return date.getTime() > now.getTime();
      });

  // Group shipments by day
  const thisWeeksShipmentsByDay = (weeks: number) => {
    // Get an array of days for the next `weeks` weeks
    const weekDays = eachDayOfInterval({
      start: now,
      end: add(now, { days: weeks * 7 }),
    });

    // Get shipments for the next `weeks` weeks
    const shipments =
      sortedData &&
      sortedData.reduce((accumulator, shipment: Shipment) => {
        const date = new Date(shipment.estimatedArrival);

        const weekDifference = differenceInWeeks(date, now);
        if (weekDifference <= weeks - 1) {
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
  // @ts-ignore
  console.log(data.shipments, sortedData);
  let component: ReactElement;
  switch (data.status) {
    case 'SUCCESS':
      component = (
        <Container className={classes.container}>
          <h1>Shipments for the next {weeksToShow * 7} days</h1>
          {thisWeeksShipmentsByDay &&
            thisWeeksShipmentsByDay(weeksToShow).map(
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
          <Button
            variant="contained"
            color="primary"
            onClick={() => setWeeksToShow(weeksToShow + 1)}
          >
            Show more shipments
          </Button>
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
