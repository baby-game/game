
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { useNavigate, useParams } from "react-router";
import Grid from "@mui/material/Grid";
import FailIcon from '../../image/fail.png'
import successIcon from '../../image/success.png'
import loadingIcon from '../../image/loading.png'
interface OpenStatus {
    open: boolean,
    setOpen: Function,
    loadingText:string,
    loadingState:string
}

export default function TipPop({ open, setOpen, loadingText, loadingState }: OpenStatus) {

    return <Dialog
        open={open}
        sx={{
            '& .MuiDialog-paper': {
                width: 200,
                maxWidth: '80%',
                background: '#fff',
            }
        }}
        maxWidth="md"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
    >
        <DialogContent>
            <Grid container className=' mb-3 flex'>
                {
                    loadingState == "loading" && <img className=' w-10 animate-spin' src={loadingIcon} alt="" />
                }

                {
                    loadingState == "success" && <img className=' w-10' src={successIcon} alt="" />
                }

                {
                    loadingState == "error" && <img className=' w-10' src={FailIcon} alt="" />
                }

                <p className=' ml-3 flex-1 leading-10'>{loadingText}  </p>
            </Grid>
        </DialogContent>
    </Dialog>
}