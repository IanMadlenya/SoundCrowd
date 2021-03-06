class Api::RecordingsController < ApplicationController
  def new
    @recording = Recording.new
  end

  def create
    @recording = Recording.new(recording_params)
    if @recording.save
      redirect_to root_url
    else
      flash.now[:errors] = @recording.errors.full_messages
      render :new
    end
  end

  def recent
    @recordings = Recording.most_recent
  end

  def update
    @recording = Recording.find(params[:id])
    @recording.update_attributes(recording_params)
  end

  def destroy
    @recording = Recording.find(params[:id])
    @recording.destroy
    render json:@recording
  end

  def show
    @recording = Recording.find(params[:id])
  end

  def index
    @recordings = Recording.all
  end

  private
  def recording_params
    params.require(:recording).permit(:user_id, :username, :title, :body, :image, :audio)
  end
end
