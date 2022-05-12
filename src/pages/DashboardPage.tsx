import { ReactElement } from 'react';
import { Container, Box, makeStyles, useTheme } from '@material-ui/core';
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
  // Sort shipments by arrival date
  const sortedData =
    data.status === 'SUCCESS' &&
    [...data.shipments]
      .sort((a: Shipment, b: Shipment) => {
        const aDate = new Date(a.estimatedArrival);
        const bDate = new Date(b.estimatedArrival);
        return aDate.getTime() - bDate.getTime();
      })
      .filter((shipment: Shipment) => {
        const date = new Date(shipment.estimatedArrival);
        return date.getTime() > now.getTime();
      });

  // Get shipments for the next 7 days
  const thisWeeksShipments =
    sortedData &&
    sortedData.reduce((accumulator, shipment: Shipment) => {
      const date = new Date(shipment.estimatedArrival);

      const weekDifference = differenceInWeeks(date, now);
      if (weekDifference === 0) {
        accumulator.push(shipment);
      }

      return accumulator;
    }, [] as Shipment[]);

  // Get an array of the next 7 days
  const weekDays = eachDayOfInterval({
    start: now,
    end: add(now, { days: 7 }),
  });

  // Group shipments by day
  const thisWeeksShipmentsByDay = weekDays.map((day: Date) => {
    const dayShipments =
      thisWeeksShipments &&
      thisWeeksShipments.filter((shipment: Shipment) => {
        return new Date(shipment.estimatedArrival).getTime() === day.getTime();
      });

    return {
      day: format(day, 'EEEE MMM d, yyyy'),
      shipments: dayShipments,
    };
  });

  let component: ReactElement;
  switch (data.status) {
    case 'SUCCESS':
      component = (
        <Container>
          <h1>Shipments for the next 7 days</h1>
          {thisWeeksShipmentsByDay &&
            thisWeeksShipmentsByDay.map(
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
