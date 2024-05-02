import { Resource } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { SEMRESATTRS_SERVICE_INSTANCE_ID } from '@opentelemetry/semantic-conventions/build/src/resource/SemanticResourceAttributes';
import nconf from 'nconf';
import { InstrumentType, MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { ExplicitBucketHistogramAggregation } from '@opentelemetry/sdk-metrics/build/src/view/Aggregation';
import { FilteringAttributesProcessor } from '@opentelemetry/sdk-metrics/build/src/view/AttributesProcessor';
import { InstrumentSelector } from '@opentelemetry/sdk-metrics/build/src/view/InstrumentSelector';
import { MeterSelector } from '@opentelemetry/sdk-metrics/build/src/view/MeterSelector';
import conf, { booleanConf, ENABLED_TELEMETRY, logApp, PLATFORM_VERSION } from '../config/conf';
import { executionContext } from '../utils/access';
import { isNotEmptyField } from '../database/utils';
import type { Settings } from '../generated/graphql';
import { getSettings } from '../domain/settings';
import { usersWithActiveSession } from '../database/session';
import { TELEMETRY_SERVICE_NAME, TelemetryMeterManager } from '../config/TelemetryMeterManager';
import type { ManagerDefinition } from './managerModule';
import { registerManager } from './managerModule';
import { MetricFileExporter } from '../config/MetricFileExporter';

const TELEMETRY_EXPORT_INTERVAL = 100000; // export data period TODO set to 1 per day
const TEMPORALITY = 0;
const TELEMETRY_MANAGER_ENABLED = booleanConf('telemetry_manager:enabled', false);
const TELEMETRY_MANAGER_KEY = conf.get('telemetry_manager:lock_key');
const SCHEDULE_TIME = 10000; // telemetry manager period

const initTelemetryManager = async () => {
  let resource = Resource.default();
  const filigranMetricReaders = [];
  // Fetch settings
  const context = executionContext('telemetry_manager');
  const settings = await getSettings(context) as Settings;
  const plateformId = settings.id;
  // -- Resource
  const filigranResource = new Resource({
    [SEMRESATTRS_SERVICE_NAME]: TELEMETRY_SERVICE_NAME,
    [SEMRESATTRS_SERVICE_VERSION]: PLATFORM_VERSION,
    [SEMRESATTRS_SERVICE_INSTANCE_ID]: plateformId,
  });
  resource = resource.merge(filigranResource);
  // File exporter
  const fileExporterReader = new PeriodicExportingMetricReader({
    exporter: new MetricFileExporter(TEMPORALITY),
    exportIntervalMillis: TELEMETRY_EXPORT_INTERVAL,
  });
  filigranMetricReaders.push(fileExporterReader);
  if (ENABLED_TELEMETRY) {
    // OTLP Exporter
    const otlpUri = nconf.get('app:telemetry:filigran:exporter_otlp');
    if (isNotEmptyField(otlpUri)) {
      const OtlpExporterReader = new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({ url: otlpUri, temporalityPreference: TEMPORALITY }),
        exportIntervalMillis: TELEMETRY_EXPORT_INTERVAL,
      });
      filigranMetricReaders.push(OtlpExporterReader);
    }
  }
  // Meter Provider creation
  const filigranMeterProvider = new MeterProvider(({
    resource,
    readers: filigranMetricReaders,
    views: [{
      aggregation: new ExplicitBucketHistogramAggregation([0, 1, 2, 3]),
      attributesProcessor: new FilteringAttributesProcessor([]),
      instrumentSelector: new InstrumentSelector({ type: InstrumentType.HISTOGRAM }),
      meterSelector: new MeterSelector(),
    }],
  }));

  const filigranTelemetryMeterManager = new TelemetryMeterManager(filigranMeterProvider);
  filigranTelemetryMeterManager.registerFiligranTelemetry();
  return filigranTelemetryMeterManager;
};

const fetchTelemetryData = async (filigranTelemetryMeterManager?: TelemetryMeterManager) => {
  if (!filigranTelemetryMeterManager) {
    logApp.error('Filigran telemetry meter manager not provided', { manager: 'TELEMETRY_MANAGER' });
  } else {
    try {
      const context = executionContext('telemetry_manager');
      // Fetch settings
      const settings = await getSettings(context) as Settings;
      // Set filigranTelemetryManager settings telemetry data
      filigranTelemetryMeterManager.setIsEEActivated(isNotEmptyField(settings.enterprise_edition) ? 1 : 0);
      filigranTelemetryMeterManager.setEEActivationDate(settings.enterprise_edition);
      filigranTelemetryMeterManager.setNumberOfInstances(settings.platform_cluster.instances_number);
      // Get number of active users since fetchTelemetryData() last execution
      const activUsers = await usersWithActiveSession(TELEMETRY_EXPORT_INTERVAL / 1000 / 60); // TODO use SCHEDULE_TIME / 1000 / 60 instead when activ users are stored in histogram
      // filigranTelemetryMeterManager.setActivUsersHistogram(activUsers.length);
      filigranTelemetryMeterManager.setActivUsersNumber(activUsers.length);
    } catch (e) {
      logApp.error(e, { manager: 'TELEMETRY_MANAGER' });
    }
  }
};

const TELEMETRY_MANAGER_DEFINITION: ManagerDefinition = {
  id: 'TELEMETRY_MANAGER',
  label: 'Telemetry manager',
  executionContext: 'telemetry_manager',
  cronSchedulerHandler: {
    handler: fetchTelemetryData,
    interval: SCHEDULE_TIME,
    lockKey: TELEMETRY_MANAGER_KEY,
    createHandlerInput: initTelemetryManager,
  },
  enabledByConfig: TELEMETRY_MANAGER_ENABLED,
  enabledToStart(): boolean {
    return this.enabledByConfig;
  },
  enabled(): boolean {
    return this.enabledByConfig;
  }
};

registerManager(TELEMETRY_MANAGER_DEFINITION);
