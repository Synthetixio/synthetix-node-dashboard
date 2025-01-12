import {usePermissions} from './usePermissions';
import {useSubmitApplicationMutation} from './useSubmitApplicationMutation';
import {useWithdrawApplicationMutation} from './useWithdrawApplicationMutation';

export function Registration() {
  const permissions = usePermissions();
  const submitApplicationMutation = useSubmitApplicationMutation();
  const withdrawApplicationMutation = useWithdrawApplicationMutation();

  const isLoading =
    permissions.isFetching ||
    submitApplicationMutation.isPending ||
    withdrawApplicationMutation.isPending;

  let content;
  switch (true) {
    case isLoading:
      content = <p>Loading..</p>;
      break;
    case permissions.data.isGranted:
      content = <h4 className="title is-4">Access granted</h4>;
      break;
    case permissions.data.isPending:
      content = (
        <>
          <h4 className="title is-4">Please wait for approval</h4>
          <button
            type="button"
            className="button is-small"
            onClick={() => withdrawApplicationMutation.mutate()}
          >
            Renounce assigned role
          </button>
        </>
      );
      break;
    default:
      content = (
        <>
          <h4 className="title is-4">Access control</h4>
          <button
            type="button"
            className="button is-small"
            onClick={() => submitApplicationMutation.mutate()}
          >
            Apply for whitelist
          </button>
        </>
      );
  }

  return (
    <div className="columns">
      <div className="column is-8 is-offset-2 has-text-centered">{content}</div>
    </div>
  );
}
