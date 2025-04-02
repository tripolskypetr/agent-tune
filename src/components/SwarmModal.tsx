import { ActionBounce, ActionState, createLsManager, openBlank, useChangeSubject, useOnce, useSubject } from "react-declarative";
import { useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Button, Card, CardActions, CardContent, CardHeader, IconButton, Typography } from "@mui/material";
import HoneyBee from "../icons/HoneyBee";
import { Close } from "@mui/icons-material";

const STORAGE = createLsManager<boolean>("AGENT_TUNE_FIRST_SWARM");

const THEME = createTheme();
const EMIT_CLICK_COUNT = 15;
const ANIMATION_DELAY = 100;

export const SwarmModal = () => {

    const [open, setOpen] = useState(false);

    const stateSubject = useSubject<ActionState>();

    const openSubject = useChangeSubject(open);

    useOnce(() => {
        let counter = 0;
        const commitClick = () => {
            if (STORAGE.getValue()) {
                return;
            }
            if (++counter === EMIT_CLICK_COUNT) {
                setOpen(true);
                STORAGE.setValue(true);
            }
        };
        document.addEventListener("click", () => {
            commitClick();
        });
        openSubject.debounce(ANIMATION_DELAY).connect(() => {
            stateSubject.next(ActionState.Abort);
        });
    });

    const renderInner = () => {
        if (!open) {
            return null;
        }
        return (
            <ActionBounce
                transparentPaper
                stateSubject={stateSubject}
                sx={{
                    position: 'fixed',
                    top: '8px',
                    right: '8px',
                    pl: 1,
                    zIndex: 999,
                }}
                onAnimationEnd={(state) => {
                    if (state === ActionState.Abort) {
                        stateSubject.next(ActionState.Initial);
                    }
                }}
            >
                <Card sx={{ position: 'relative' }}>
                    <IconButton size="large" sx={{ position: 'absolute', top: '2px', right: '2px' }} onClick={() => setOpen(false)}>
                        <Close />
                    </IconButton>
                    <CardHeader
                        avatar={
                            <HoneyBee />
                        }
                        title={(
                            <Typography variant="h5" component="div">
                                The Agent Swarm Kit
                            </Typography>
                        )}
                        subheader={(
                            <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>
                                Unleash the power of collaborative AI
                            </Typography>
                        )}
                    />
                    <CardContent>
                        <Typography variant="body2">
                            This library empowers you to create intelligent, modular agent networks that work together 🖥️ <br />
                            Perfect for automating workflows, solving complex problems, or designing next-gen AI systems 😊
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Button
                            size="small"
                            onClick={() => {
                                openBlank("https://github.com/tripolskypetr/agent-swarm-kit");
                                setOpen(false);
                            }}
                        >
                            Continue
                        </Button>
                    </CardActions>
                </Card>
            </ActionBounce>
        );
    }

    return (
        <ThemeProvider theme={THEME}>
            {renderInner()}
        </ThemeProvider>
    );
};

export default SwarmModal;

