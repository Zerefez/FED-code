import PropTypes from 'prop-types';

export default function ModelInfo({ model }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3 text-foreground">Model Information</h2>
      <div className="bg-secondary/20 p-4 rounded-md mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="mb-1 text-muted-foreground">
              <span className="font-medium text-foreground">Name:</span> {model.firstName} {model.lastName}
            </p>
            <p className="mb-1 text-muted-foreground">
              <span className="font-medium text-foreground">Email:</span> {model.email}
            </p>
            {model.phoneNo && (
              <p className="mb-1 text-muted-foreground">
                <span className="font-medium text-foreground">Phone:</span> {model.phoneNo}
              </p>
            )}
          </div>
          <div>
            {model.nationality && (
              <p className="mb-1 text-muted-foreground">
                <span className="font-medium text-foreground">Nationality:</span> {model.nationality}
              </p>
            )}
            {model.height && (
              <p className="mb-1 text-muted-foreground">
                <span className="font-medium text-foreground">Height:</span> {model.height} m
              </p>
            )}
            {model.hairColor && (
              <p className="mb-1 text-muted-foreground">
                <span className="font-medium text-foreground">Hair Color:</span> {model.hairColor}
              </p>
            )}
            {model.eyeColor && (
              <p className="mb-1 text-muted-foreground">
                <span className="font-medium text-foreground">Eye Color:</span> {model.eyeColor}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

ModelInfo.propTypes = {
  model: PropTypes.object.isRequired
}; 