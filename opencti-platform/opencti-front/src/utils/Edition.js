import * as R from 'ramda';

export const convertStatus = (t, element) => ((element?.status?.template?.name ?? null) === null
  ? ''
  : {
    label: element?.status?.template?.name ?? null,
    color: element?.status?.template?.color ?? null,
    value: element?.status?.id ?? null,
    order: element?.status?.order ?? null,
  });

export const convertMarkings = (element) => (element?.objectMarking?.edges ?? []).map((n) => ({
  label: n.node.definition,
  value: n.node.id,
}));

export const convertOrganizations = (element) => R.pipe(
  R.pathOr([], ['objectOrganization', 'edges']),
  R.map((n) => ({
    label: n.node.name,
    value: n.node.id,
  })),
)(element);

export const convertCreatedBy = (element) => (R.pathOr(null, ['createdBy', 'name'], element) === null
  ? ''
  : {
    label: element?.createdBy?.name ?? null,
    value: element?.createdBy?.id ?? null,
  });
