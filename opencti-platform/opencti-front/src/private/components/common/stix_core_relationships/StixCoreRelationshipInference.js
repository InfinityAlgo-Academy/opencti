import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { withStyles, withTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import ForceGraph2D from 'react-force-graph-2d';
import inject18n from '../../../../components/i18n';
import {
  buildGraphData,
  linkPaint,
  nodeAreaPaint,
  nodePaint,
} from '../../../../utils/Graph';

const styles = () => ({
  container: {
    position: 'relative',
  },
  paper: {
    width: '100%',
    position: 'relative',
    height: 500,
    minHeight: 500,
    margin: '10px 0 0 0',
    padding: '15px',
    borderRadius: 6,
  },
});

class StixCoreRelationshipInference extends Component {
  constructor(props) {
    super(props);
    this.initialized = false;
    this.graph = React.createRef();
  }

  initialize() {
    if (this.initialized) return;
    if (this.graph && this.graph.current) {
      this.graph.current.d3Force('link').distance(50);
      const currentContext = this;
      setTimeout(
        () => currentContext.graph
          && currentContext.graph.current
          && currentContext.graph.current.zoomToFit(0, 50),
        500,
      );
      this.initialized = true;
    }
  }

  componentDidMount() {
    this.initialize();
  }

  render() {
    const {
      t, classes, inference, theme, stixCoreRelationship,
    } = this.props;
    const width = window.innerWidth - 450;
    const graphObjects = [
      R.assoc('inferred', true, stixCoreRelationship),
      stixCoreRelationship.from,
      stixCoreRelationship.to,
      ...inference.explanation,
      ...R.pipe(
        R.filter((n) => n.from && n.to),
        R.map((n) => [n.from, n.to]),
        R.flatten,
      )(inference.explanation),
    ];
    const graphData = buildGraphData(graphObjects, [], t);
    return (
      <Paper
        classes={{ root: classes.paper }}
        elevation={2}
        key={inference.rule.id}
      >
        <Typography variant="h3" gutterBottom={true}>
          {t(inference.rule.name)}
        </Typography>
        <ForceGraph2D
          ref={this.graph}
          width={width}
          height={450}
          graphData={graphData}
          nodeRelSize={4}
          nodeCanvasObject={(node, ctx) => nodePaint(node, node.color, ctx, false)
          }
          nodePointerAreaPaint={nodeAreaPaint}
          linkCanvasObjectMode={() => 'after'}
          linkCanvasObject={(link, ctx) => linkPaint(link, ctx, theme.palette.text.primary)
          }
          linkColor={(link) => (link.inferred
            ? theme.palette.secondary.main
            : theme.palette.primary.main)
          }
          linkDirectionalParticles={(link) => (link.inferred ? 20 : 0)}
          linkDirectionalParticleWidth={1}
          linkDirectionalParticleSpeed={() => 0.004}
          linkDirectionalArrowLength={3}
          linkDirectionalArrowRelPos={0.99}
          cooldownTicks={'Infinity'}
          enableZoomInteraction={false}
          enablePanInteraction={false}
          enableNodeDrag={false}
        />
      </Paper>
    );
  }
}

StixCoreRelationshipInference.propTypes = {
  inference: PropTypes.object,
  stixCoreRelationship: PropTypes.object,
};

export default R.compose(
  inject18n,
  withStyles(styles),
  withTheme,
)(StixCoreRelationshipInference);
