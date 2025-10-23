import React from 'react';
import {
  Card,
  CardHeader,
  CardPreview,
  Text,
  makeStyles,
  tokens,
  shorthands
} from '@fluentui/react-components';

const useStyles = makeStyles({
  card: {
    height: 'auto',
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 8px 24px ${tokens.colorNeutralShadowAmbient}`
    }
  },
  header: {
    ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalL),
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`
  },
  title: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    margin: 0
  },
  content: {
    ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalL),
    height: 'calc(100% - 60px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => {
  const styles = useStyles();

  return (
    <Card className={styles.card}>
      <CardHeader>
        <div className={styles.header}>
          <Text className={styles.title}>{title}</Text>
        </div>
      </CardHeader>
      <CardPreview>
        <div className={styles.content}>
          {children}
        </div>
      </CardPreview>
    </Card>
  );
};

export default ChartCard;
