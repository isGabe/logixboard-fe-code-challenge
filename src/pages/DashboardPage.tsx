import { ReactElement } from "react"
import { Box, makeStyles, useTheme } from "@material-ui/core"
import Loader from 'react-loader-spinner'
import { FetchShipmentsResult, LoadingResult } from "../data/fetch-shipments"
type DashboardPageProps = {
  data: FetchShipmentsResult | LoadingResult;
}

const useStyles = makeStyles({
  loader: {
      margin: 'auto',
      width: 'fit-content',
      marginTop: 200
  }
})
export const DashboardPage: React.FC<DashboardPageProps> = ({ data }) => {
  const classes = useStyles()
  const theme = useTheme()

  let component: ReactElement
  switch (data.status) {
      case 'SUCCESS':
          component =
          <div>
           Yay
          </div>
          break;
      case 'LOADING':
          component = <Box className={classes.loader}>
              <Loader type="Grid" color={theme.palette.primary.main} />
          </Box >
          break
      case 'ERROR':
          component = <p>Error</p>
          break
  }
  return component
}
